const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// Get attendance overview
router.get('/overview', async (req, res) => {
  const students = await Student.find();
  const attendanceData = await Promise.all(
    students.map(async (student) => {
      const attendance = await Attendance.find({ studentId: student._id });
      const daysPresent = attendance.filter(a => a.status === 'present').length;
      const totalDays = attendance.length;
      const percentage = totalDays ? (daysPresent / totalDays) * 100 : 0;

      return {
        ...student.toObject(),
        daysPresent,
        totalDays,
        attendancePercentage: Math.round(percentage)
      };
    })
  );
  res.json(attendanceData);
});

// Add attendance
router.post('/add', async (req, res) => {
  const { date, attendance } = req.body;
  
  const attendanceRecords = Object.entries(attendance).map(([studentId, status]) => ({
    studentId,
    date,
    status
  }));

  await Attendance.insertMany(attendanceRecords);
  res.json({ message: 'Attendance recorded successfully' });
});

module.exports = router;
