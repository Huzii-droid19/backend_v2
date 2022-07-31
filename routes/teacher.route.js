const express = require("express");
const models = require("../models");
const bcrypt = require("bcrypt");
const router = express.Router();
const sequelize = require("sequelize");

router.post("/login", async (req, res) => {
  try {
    const { faculty_no, password } = req.body;
    await models.Teacher.findOne({
      where: {
        faculty_no: faculty_no,
      },
    }).then((teacher) => {
      if (teacher) {
        bcrypt.compare(password, teacher.password).then((result) => {
          if (result) {
            res.status(200).json({
              login: true,
              message: "Teacher login successful",
              teacher: teacher,
            });
          } else {
            res.status(401).json({
              login: false,
              message: "Invalid password",
              faculty_no: faculty_no,
            });
          }
        });
      } else {
        res.status(404).json({
          login: false,
          maessgae: "Invalid Faculty Number.",
          faculty_no: faculty_no,
          teacher: teacher,
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      login: false,
      message: error.message,
    });
  }
});

// get all classes that the teacher teaches
router.get("/get-classes/:teacher_id", async (req, res) => {
  try {
    const teacher_id = req.params.teacher_id;
    await models.Teacher.findOne({
      where: {
        id: teacher_id,
      },
      include: [
        {
          model: models.Class,
          as: "class",
        },
        {
          model: models.Section,
          as: "section",
          include: [
            { model: models.Assignments, as: "Assignments" },
            { model: models.Tests, as: "Tests" },
            { model: models.Exams, as: "Exams" },
          ],
        },
      ],
    }).then((teacher) => {
      if (teacher) {
        const dataObject = {
          class: teacher.class,
          section: teacher.section,
          assignments: teacher.section.Assignments.length,
          exams: teacher.section.Exams.length,
          tests: teacher.section.Tests.length,
        };
        const data = [dataObject];
        return res.status(200).json({
          data: data,
        });
      } else {
        return res.status(404).json({ message: "Teacher not found" });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error while fetching classes",
      error: error.message,
    });
  }
});

// get teacher
router.get("/teacher-details/:teacher_id", async (req, res) => {
  await models.Teacher.findOne({
    where: {
      id: req.params.teacher_id,
    },
  })
    .then((teacher) => {
      if (teacher) {
        return res.status(200).json({
          teacher: teacher,
        });
      } else {
        return res.status(404).json({ message: "Teacher not found" });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Internal server error while fetching teacher",
        error: error.message,
      });
    });
});

// teacher attendance
router.get("/attendance/:id", async (req, res) => {
  await models.TeacherAttendance.findAll({
    where: {
      teacher_id: req.params.id,
    },

    include: [{ model: models.Admin, as: "Admin", attributes: ["name"] }],
  })
    .then((attendance) => {
      if (attendance) {
        return res.status(200).json({
          attendance: attendance,
        });
      } else {
        return res.status(404).json({
          message: "No attendance found",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Internal server error while fetching attendance",
        error: error.message,
      });
    });
});

// queries and feedback
router.get("/queries/:teacher_id", async (req, res) => {
  await models.Query.findAll({
    where: {
      teacher_id: req.params.teacher_id,
    },
    include: [
      {
        model: models.Subjects,
        as: "subject",
      },
    ],
  })
    .then((queries) => {
      if (queries) {
        return res.status(200).json({
          queries: queries,
        });
      } else {
        return res.status(404).json({
          message: "No queries found",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Internal server error while fetching queries",
        error: error.message,
      });
    });
});

// add query response
router.post("/query-response", async (req, res) => {
  const { query_id, teacher_id, response } = req.body;
  await models.Query.findOne({
    where: {
      id: query_id,
      teacher_id: teacher_id,
    },
  })
    .then((query) => {
      if (query) {
        query
          .update({
            response: req.body.response,
            status: true,
          })
          .then((response) => {
            return res.status(200).json({
              message: "Query response updated",
              query: response,
            });
          });
      } else {
        return res.status(404).json({
          message: "Query not found",
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Internal server error while updating query response",
        error: error.message,
      });
    });
});

// get attendance
router.get("/get-teacher-attendance/:teacher_id", async (req, res) => {
  try {
    const teacher_id = req.params.teacher_id;
    const attendance = await models.TeacherAttendance.findAll({
      where: {
        teacher_id: teacher_id,
      },
    });
    if (attendance.length > 0) {
      res.status(200).json({
        message: "Attendance fetched successfully",
        attendance: attendance,
      });
    } else {
      res.status(404).json({
        message: "No attendance found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while fetching attendance",
      error: error.message,
    });
  }
});

// get attendance graph
router.get("/get-attendance-graph/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const presents = await models.TeacherAttendance.findAll({
      where: {
        teacher_id: id,
        status: true,
      },
      attributes: [
        [
          sequelize.fn("date_trunc", "month", sequelize.col("attendance_date")),
          "month",
        ],
        [sequelize.fn("count", sequelize.col("status")), "present_days"],
      ],
      group: [
        sequelize.fn("date_trunc", "month", sequelize.col("attendance_date")),
        "month",
      ],
    });
    const absents = await models.TeacherAttendance.findAll({
      where: {
        teacher_id: id,
        status: false,
      },
      attributes: [
        [
          sequelize.fn("date_trunc", "month", sequelize.col("attendance_date")),
          "month",
        ],
        [sequelize.fn("count", sequelize.col("status")), "absent_days"],
      ],
      group: [
        sequelize.fn("date_trunc", "month", sequelize.col("attendance_date")),
        "month",
      ],
    });

    const present_data = presents.map((p) => {
      return {
        x: p.dataValues.month.toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
        y: p.dataValues.present_days,
      };
    });
    const absent_data = absents.map((a) => {
      return {
        x: a.dataValues.month.toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
        y: a.dataValues.absent_days,
      };
    });
    const present_month = presents.map((p) => {
      return p.dataValues.month.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    });
    const absent_month = absents.map((a) => {
      return a.dataValues.month.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    });

    const months = present_month.concat(
      absent_month.filter((item) => item.indexOf(item) < 0)
    );
    return res.status(200).json({
      message: "Attendance fetched successfully",
      presents: present_data,
      absents: absent_data,
      months: months,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while fetching attendance",
      error: error.message,
    });
  }
});

// get performance graph
router.get("/get-performance-graph/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await models.Query.findAll({
      where: {
        teacher_id: id,
        type: "feedback",
      },
      attributes: [
        [sequelize.fn("count", sequelize.col("type")), "feedback_count"],
      ],
      include: [
        {
          model: models.Subjects,
          as: "subject",
          attributes: ["subject_name"],
        },
      ],
      group: ["subject.id", "subject.subject_name"],
    });
    const complaints = await models.Query.findAll({
      where: {
        teacher_id: id,
        type: "complaint",
      },
      attributes: [
        [sequelize.fn("count", sequelize.col("type")), "complaint_count"],
      ],
      include: [
        {
          model: models.Subjects,
          as: "subject",
          attributes: ["subject_name"],
        },
      ],
      group: ["subject.id", "subject.subject_name"],
    });
    const feedback_data = feedback.map((f) => {
      return {
        y: f.dataValues.subject.subject_name,
        x: f.dataValues.feedback_count,
      };
    });
    const complaints_data = complaints.map((c) => {
      return {
        y: c.dataValues.subject.subject_name,
        x: c.dataValues.complaint_count,
      };
    });
    const feedback_subjects = feedback.map((f) => {
      return f.dataValues.subject.subject_name;
    });
    const complaint_subjects = complaints.map((c) => {
      return c.dataValues.subject.subject_name;
    });
    const subjects = feedback_subjects.concat(
      complaint_subjects.filter((item) => item.indexOf(item) < 0)
    );

    return res.status(200).json({
      message: "Performance fetched successfully",
      feedback: feedback_data,
      complaints: complaints_data,
      subjects: subjects,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while fetching performance",
      error: error.message,
    });
  }
});

module.exports = router;
