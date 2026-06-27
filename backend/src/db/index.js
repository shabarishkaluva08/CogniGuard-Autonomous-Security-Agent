const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cogniguard_ai',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function logSecurityEvent(eventType, confidence, snapshotUrl, reason) {
  const query = `
    INSERT INTO security_events (event_type, confidence, snapshot_url, reason)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await pool.execute(query, [eventType, confidence, snapshotUrl || null, reason]);
  return result.insertId;
}

async function updateAgentState(key, value) {
  const query = `
    INSERT INTO agent_state (state_key, state_value)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE state_value = VALUES(state_value)
  `;
  await pool.execute(query, [key, value]);
}

async function getConfiguration() {
  const [rows] = await pool.execute('SELECT config_key, config_value FROM configuration');
  const config = {};
  for (const row of rows) {
    config[row.config_key] = row.config_value;
  }
  return config;
}

async function saveUserProfile(profileData) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Clear existing users to ensure only one authorized user (as per requirement)
    await connection.execute('DELETE FROM authorized_users');
    
    const { fullName, email, employeeId, profilePicture, faces, descriptor, metadata } = profileData;
    
    const [userResult] = await connection.execute(
      'INSERT INTO authorized_users (full_name, email, employee_id, profile_picture, face_descriptor, enrollment_quality_score, images_used, avg_detection_confidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        fullName, 
        email || null, 
        employeeId || null, 
        profilePicture || null,
        descriptor ? JSON.stringify(descriptor) : null,
        metadata?.qualityScore || null,
        metadata?.imagesUsed || null,
        metadata?.avgConfidence || null
      ]
    );
    
    const userId = userResult.insertId;
    
    if (faces && faces.length > 0) {
      for (const face of faces) {
        await connection.execute(
          'INSERT INTO user_faces (user_id, base64_image) VALUES (?, ?)',
          [userId, face]
        );
      }
    }
    
    await connection.commit();
    return userId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getUserProfile(includeFaces = false) {
  const [users] = await pool.execute('SELECT * FROM authorized_users LIMIT 1');
  if (users.length === 0) return null;
  
  const user = users[0];
  const [faces] = await pool.execute('SELECT base64_image FROM user_faces WHERE user_id = ?', [user.id]);
  
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    employeeId: user.employee_id,
    profilePicture: user.profile_picture,
    descriptor: user.face_descriptor,
    metadata: {
      qualityScore: user.enrollment_quality_score,
      imagesUsed: user.images_used,
      avgConfidence: user.avg_detection_confidence
    },
    facesCount: faces.length,
    faces: includeFaces ? faces.map(f => f.base64_image) : undefined
  };
}

async function deleteUserProfile() {
  await pool.execute('DELETE FROM authorized_users');
}

module.exports = {
  pool,
  logSecurityEvent,
  updateAgentState,
  getConfiguration,
  saveUserProfile,
  getUserProfile,
  deleteUserProfile
};
