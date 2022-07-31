const express = require("express");
const models = require("../models");
const fs = require("fs");
const AssignmentUpload = require("../store/assignment.store");
const TestUpload = require("../store/test.store");
const ExamUpload = require("../store/exam.store");
const sequelize = require("sequelize");

const router = express.Router();

// get all subjects that being taught in section and class
router.post("/get-all-subjects", async (req, res) => {
  const { class_id, section_id } = req.body;
  await models.Subjects.findAll({
    where: {
      section_id: section_id,
      class_id: class_id,
    },
  })
    .then((subjects) => {
      if (subjects.length > 0) {
        res.status(200).json({
          message: "Subjects Found",
          subjects: subjects,
        });
      } else {
        res.status(404).json({
          message: "No Subjects Found",
          subjects: subjects,
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error while fetching subjects",
        error: error.message,
      });
    });
});

// get section based on id
router.get("/get-section/:id", async (req, res) => {
  const { id } = req.params;
  await models.Section.findOne({
    where: {
      id: id,
    },
  })

    .then((section) => {
      if (section) {
        res.status(200).json({
          message: "Section Found",
          section: section,
        });
      } else {
        res.status(404).json({
          message: "No Section Found",
          section: section,
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error while fetching section",
        error: error.message,
      });
    });
});

// get all students added in class
router.get("/get-all-students/:class_id/:section_id", async (req, res) => {
  await models.Student.findAll({
    where: {
      section_id: req.params.section_id,
      class_id: req.params.class_id,
    },
  })
    .then((students) => {
      if (students.length > 0) {
        res.status(200).json({
          message: "Students Found",
          students: students,
        });
      } else {
        res.status(404).json({
          message: "No Students Found",
          students: students,
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error while fetching students",
        error: error.message,
      });
    });
});

// mark student attendance
router.post("/mark-attendance", async (req, res) => {
  try {
    const { tableData, attendance_date, section_id, class_id } = req.body;
    tableData.forEach(async (student) => {
      await models.StudentAttendance.create({
        student_id: student.student_id,
        attendance_date: attendance_date,
        status: student.attendance_status,
        section_id: section_id,
        class_id: class_id,
      });
    });
    res.status(200).json({
      message: "Attendance Marked Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while marking attendance",
      error: error.message,
    });
  }
});

// get all assignments addded in class and section
router.post("/get-all-assignments", async (req, res) => {
  const { class_id, section_id } = req.body;
  await models.Assignments.findAll({
    where: {
      class_id: class_id,
      section_id: section_id,
    },
    include: [
      {
        model: models.Class,
        as: "class",
      },
      {
        model: models.Section,
        as: "section",
      },
    ],
  })
    .then((assignments) => {
      if (assignments.length > 0) {
        return res.status(200).json({
          message: "Assignments Found",
          assignments: assignments,
        });
      } else {
        return res.status(404).json({
          message: "No Assignments Found",
          assignments: assignments,
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while fetching assignments",
        error: error.message,
      });
    });
});

// get all assignment submisssions
router.post("/assignment-submissions", async (req, res) => {
  const { class_id, section_id } = req.body;
  await models.Student.findAll({
    where: {
      class_id: class_id,
      section_id: section_id,
    },
    include: [
      {
        model: models.AssignmentSubmission,
        as: "assignmentsubmissions",
      },
    ],
  })
    .then((students) => {
      if (students.length > 0) {
        return res.status(200).json({
          message: "Assignment Submissions Found",
          submissions: students,
        });
      } else {
        return res.status(404).json({
          message: "No Assignment Submissions Found",
          submissions: students,
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while fetching assignment submissions",
        error: error.message,
      });
    });
});

// add assignment marks
router.post("/add-assignment-marks", async (req, res) => {
  try {
    const { tableData } = req.body;
    tableData.forEach(async (data) => {
      await models.AssignmentSubmission.update(
        {
          obtained_marks: data.marks,
        },
        {
          where: {
            id: data.id,
          },
        }
      );
    });
    return res.status(200).json({
      message: "Assignment Marks Added",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while adding assignment marks",
      error: error.message,
    });
  }
});

// upload assignment
router.post("/upload-assignment", async (req, res) => {
  AssignmentUpload(req, res, async (err) => {
    if (err) {
      res.status(500).json({
        message: "Error while uploading assignment",
        error: err.message,
      });
    } else {
      const {
        title,
        details,
        marks,
        deadline,
        subject_id,
        class_id,
        section_id,
      } = req.body;
      console.log(title);
      const { file } = req;
      const path = file.path;
      await models.Assignments.create({
        details: details,
        title: title,
        marks: marks,
        deadline: deadline,
        file_uri: path,
        subject_id: subject_id,
        class_id: class_id,
        section_id: section_id,
      })
        .then((assignment) => {
          res.status(200).json({
            message: "Assignment Uploaded",
            assignment: assignment,
          });
        })
        .catch((error) => {
          res.status(500).json({
            message: "Error while uploading assignment",
            error: error.message,
          });
        });
    }
  });
});

// download assignment
router.get("/download-assignment/:id", async (req, res) => {
  const id = req.params.id;
  await models.Assignments.findOne({
    where: {
      id: id,
    },
  })
    .then((assignment) => {
      if (assignment) {
        res.download(assignment.file_uri);
      } else {
        res.status(404).json({
          message: "Assignment Not Found",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error while fetching assignment",
        error: error.message,
      });
    });
});

// update assignment
router.put("/update-assignment/", async (req, res) => {
  const { id, title, details, marks, deadline } = req.body;
  await models.Assignments.update(
    {
      title: title,
      details: details,
      marks: marks,
      deadline: deadline,
    },
    {
      where: {
        id: id,
      },
    }
  )
    .then((assignment) => {
      if (assignment) {
        res.status(200).json({
          message: "Assignment Updated",
          assignment: assignment,
        });
      } else {
        res.status(404).json({
          message: "Assignment Not Found",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error while updating assignment",
        error: error.message,
      });
    });
});

// delete assignment
router.delete("/delete-assignment/:id", async (req, res) => {
  const { id } = req.params;
  await models.Assignments.findOne({
    where: {
      id: id,
    },
  })
    .then((assignment) => {
      if (assignment) {
        fs.stat(assignment.file_uri, function (err, stats) {
          if (err) {
            return res.status(500).json({
              message: "Error while deleting assignment",
              error: err.message,
            });
          }
          fs.unlink(assignment.file_uri, function (err) {
            if (err) {
              return res.status(500).json({
                message: "Error while deleting assignment",
                error: err.message,
              });
            }
            assignment.destroy();
          });
        });
        return res.status(200).json({
          message: "Assignment Deleted",
        });
      } else {
        res.status(404).json({
          message: "Assignment Not Found",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error while deleting assignment",
        error: error.message,
      });
    });
});

// get all tests present in class and section
router.post("/get-all-tests", async (req, res) => {
  const { class_id, section_id } = req.body;
  await models.Tests.findAll({
    where: {
      class_id: class_id,
      section_id: section_id,
    },
    include: [
      {
        model: models.Class,
        as: "class",
      },
      {
        model: models.Section,
        as: "section",
      },
      {
        model: models.TestSubmission,
        as: "submissions",
        required: false,
        include: [
          {
            model: models.Student,
            as: "student",
            attributes: ["id", "registration_no", "name"],
          },
        ],
      },
    ],
  })
    .then((tests) => {
      if (tests.length > 0) {
        return res.status(200).json({
          message: "Tests Found",
          tests: tests,
        });
      } else {
        return res.status(404).json({
          message: "No Tests Found",
          tests: tests,
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while fetching tests",
        error: error.message,
      });
    });
});

// get all test submissions
router.post("/test-submissions/", async (req, res) => {
  const { class_id, section_id } = req.body;
  await models.Student.findAll({
    where: {
      class_id: class_id,
      section_id: section_id,
    },
    include: [
      {
        model: models.TestSubmission,
        as: "testsubmissions",
      },
    ],
  })
    .then((students) => {
      if (students.length > 0) {
        return res.status(200).json({
          message: "Test Submissions Found",
          submissions: students,
        });
      } else {
        return res.status(404).json({
          message: "No Test Submissions Found",
          submissions: students,
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while fetching submissions",
        error: error.message,
      });
    });
});

// add test marks for submission
router.post("/add-test-marks", async (req, res) => {
  try {
    const { tableData } = req.body;
    tableData.forEach(async (data) => {
      await models.TestSubmission.update(
        {
          obtained_marks: data.marks,
        },
        {
          where: {
            id: data.id,
          },
        }
      ).catch((error) => {
        return res.status(500).json({
          message: "Error while adding marks",
          error: error.message,
        });
      });
    });
    return res.status(200).json({
      message: "Marks Added",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while adding marks",
      error: error.message,
    });
  }
});

// upload test
router.post("/upload-test", async (req, res) => {
  TestUpload(req, res, async (err) => {
    if (err) {
      res.status(500).json({
        message: "Error while uploading test",
        error: err.message,
      });
    } else {
      const {
        title,
        details,
        marks,
        deadline,
        subject_id,
        class_id,
        section_id,
      } = req.body;
      const { file } = req;
      const path = file.path;
      await models.Tests.create({
        details: details,
        title: title,
        marks: marks,
        deadline: deadline,
        file_uri: path,
        subject_id: subject_id,
        class_id: class_id,
        section_id: section_id,
      })
        .then((test) => {
          res.status(200).json({
            message: "Test Uploaded",
            test: test,
          });
        })
        .catch((error) => {
          res.status(500).json({
            message: "Error while uploading test",
            error: error.message,
          });
        });
    }
  });
});

// download test
router.get("/download-test/:id", async (req, res) => {
  const id = req.params.id;
  await models.Tests.findOne({
    where: {
      id: id,
    },
  })
    .then((test) => {
      if (test) {
        res.download(test.file_uri);
      } else {
        res.status(404).json({
          message: "Test Not Found",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error while fetching test",
        error: error.message,
      });
    });
});

// update test
router.put("/update-test/", async (req, res) => {
  const { id, title, details, marks, deadline } = req.body;
  await models.Tests.update(
    {
      title: title,
      details: details,
      marks: marks,
      deadline: deadline,
    },
    {
      where: {
        id: id,
      },
    }
  )
    .then((test) => {
      if (test) {
        res.status(200).json({
          message: "Test Updated",
          test: test,
        });
      } else {
        res.status(404).json({
          message: "Test Not Found",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error while updating test",
        error: error.message,
      });
    });
});

// delete test
router.delete("/delete-test/:id", async (req, res) => {
  const { id } = req.params;
  await models.Tests.findOne({
    where: {
      id: id,
    },
  })
    .then((test) => {
      if (test) {
        fs.stat(test.file_uri, function (err, stats) {
          if (err) {
            return res.status(500).json({
              message: "Error while deleting test",
              error: err.message,
            });
          }
          fs.unlink(test.file_uri, function (err) {
            if (err) {
              return res.status(500).json({
                message: "Error while deleting test",
                error: err.message,
              });
            }
            test.destroy();
          });
        });
        return res.status(200).json({
          message: "Test Deleted",
        });
      } else {
        res.status(404).json({
          message: "Test Not Found",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error while deleting test",
        error: error.message,
      });
    });
});

// get all exams
router.post("/get-all-exams", async (req, res) => {
  const { class_id, section_id } = req.body;
  await models.Exams.findAll({
    where: {
      class_id: class_id,
      section_id: section_id,
    },
    include: [
      {
        model: models.Class,
        as: "class",
      },
      {
        model: models.Section,
        as: "section",
      },
    ],
  })

    .then((exams) => {
      if (exams.length > 0) {
        return res.status(200).json({
          message: "Exams Found",
          exams: exams,
        });
      } else {
        return res.status(404).json({
          message: "No Exams Found",
          exams: exams,
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while fetching exams",
        error: error.message,
      });
    });
});

// get all exam submissions
router.post("/exam-submissions", async (req, res) => {
  const { class_id, section_id } = req.body;
  await models.Student.findAll({
    where: {
      class_id: class_id,
      section_id: section_id,
    },
    include: [
      {
        model: models.ExamSubmission,
        as: "examsubmissions",
      },
    ],
  })
    .then((students) => {
      if (students.length > 0) {
        return res.status(200).json({
          message: "Exam Submissions Found",
          submissions: students,
        });
      } else {
        return res.status(404).json({
          message: "No Exam Submissions Found",
          submissions: students,
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while fetching exam submissions",
        error: error.message,
      });
    });
});

// add exam marks
router.post("/add-exam-marks", async (req, res) => {
  try {
    const { tableData } = req.body;
    tableData.forEach(async (data) => {
      await models.ExamSubmission.update(
        {
          obtained_marks: data.marks,
        },
        {
          where: {
            id: data.id,
          },
        }
      );
    });
    return res.status(200).json({
      message: "Exam Marks Added",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while adding exam marks",
      error: error.message,
    });
  }
});

// upload exam
router.post("/upload-exam", async (req, res) => {
  ExamUpload(req, res, async (err) => {
    if (err) {
      res.status(500).json({
        message: "Error while uploading exam",
        error: err.message,
      });
    } else {
      const {
        title,
        details,
        marks,
        deadline,
        subject_id,
        class_id,
        section_id,
      } = req.body;
      const { file } = req;
      const path = file.path;
      await models.Exams.create({
        details: details,
        title: title,
        marks: marks,
        deadline: deadline,
        file_uri: path,
        subject_id: subject_id,
        class_id: class_id,
        section_id: section_id,
      })
        .then((exam) => {
          res.status(200).json({
            message: "Exam Uploaded",
            exam: exam,
          });
        })
        .catch((error) => {
          res.status(500).json({
            message: "Error while uploading exam",
            error: error.message,
          });
        });
    }
  });
});

// download exam
router.get("/download-exam/:id", async (req, res) => {
  const id = req.params.id;
  await models.Exams.findOne({
    where: {
      id: id,
    },
  })
    .then((exam) => {
      if (exam) {
        res.download(exam.file_uri);
      } else {
        res.status(404).json({
          message: "Exam Not Found",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error while fetching exam",
        error: error.message,
      });
    });
});

// update exam
router.put("/update-exam/", async (req, res) => {
  const { id, title, details, marks, deadline } = req.body;
  await models.Exams.update(
    {
      title: title,
      details: details,
      marks: marks,
      deadline: deadline,
    },
    {
      where: {
        id: id,
      },
    }
  )
    .then((exam) => {
      if (exam) {
        res.status(200).json({
          message: "Exam Updated",
          exam: exam,
        });
      } else {
        res.status(404).json({
          message: "Exam Not Found",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error while updating exam",
        error: error.message,
      });
    });
});

// delete exam
router.delete("/delete-exam/:id", async (req, res) => {
  const { id } = req.params;
  await models.Exams.findOne({
    where: {
      id: id,
    },
  })

    .then((exam) => {
      if (exam) {
        fs.stat(exam.file_uri, function (err, stats) {
          if (err) {
            return res.status(500).json({
              message: "Error while deleting exam",
              error: err.message,
            });
          }
          fs.unlink(exam.file_uri, function (err) {
            if (err) {
              return res.status(500).json({
                message: "Error while deleting exam",
                error: err.message,
              });
            }
            exam.destroy();
          });
        });
        return res.status(200).json({
          message: "Exam Deleted",
        });
      } else {
        res.status(404).json({
          message: "Exam Not Found",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error while deleting exam",
        error: error.message,
      });
    });
});

// add meeting
router.post("/add-meeting", async (req, res) => {
  const { date, link, teacher_id, section_id } = req.body;
  await models.PTMDetails.destroy({
    where: {
      section_id: section_id,
      teacher_id: teacher_id,
    },
  });
  await models.PTMDetails.create({
    ptm_date: date,
    meet_link: link,
    teacher_id: teacher_id,
    section_id: section_id,
  })
    .then((ptm) => {
      res.status(200).json({
        message: "Meeting Added",
        meeting: ptm,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error while adding meeting",
        error: error.message,
      });
    });
});

// get all meetings
router.get("/get-all-meetings/:teacher_id/:section_id", async (req, res) => {
  await models.PTMDetails.findAll({
    where: {
      teacher_id: req.params.teacher_id,
      section_id: req.params.section_id,
    },
    include: [
      {
        model: models.Teacher,
        as: "teacher",
        attributes: ["name"],
      },
    ],
  })
    .then((meetings) => {
      if (meetings) {
        res.status(200).json({
          message: "Meetings Fetched",
          meetings: meetings,
        });
      } else {
        res.status(404).json({
          message: "Meetings Not Found",
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error while fetching meetings",
        error: error.message,
      });
    });
});

// get attendance graph based on section id
router.get("/get-attendance-graph/:section_id", async (req, res) => {
  try {
    const { section_id } = req.params;
    const presents = await models.StudentAttendance.findAll({
      where: {
        section_id: section_id,
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
    const absents = await models.StudentAttendance.findAll({
      where: {
        section_id: section_id,
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

// get academic record based on section id
// get academic data from graph
router.get("/get-academic-graph/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const assignments = await models.Assignments.findAll({
      where: {
        section_id: id,
      },
      attributes: ["id", "title"],
      include: [
        {
          model: models.AssignmentSubmission,
          attributes: ["assignment_id", "obtained_marks"],
          as: "submissions",
          group: ["assignment_id"],
        },
        {
          model: models.Subjects,
          attributes: ["subject_name"],
          as: "subject",
        },
      ],
    });
    const exams = await models.Exams.findAll({
      where: {
        section_id: id,
      },
      attributes: ["id", "title"],
      include: [
        {
          model: models.ExamSubmission,
          attributes: ["id", "obtained_marks"],
          as: "submissions",
        },
        {
          model: models.Subjects,
          attributes: ["subject_name"],
          as: "subject",
        },
      ],
    });
    const tests = await models.Tests.findAll({
      where: {
        section_id: id,
      },
      attributes: ["id", "title"],
      include: [
        {
          model: models.TestSubmission,
          attributes: ["id", "obtained_marks"],
          as: "submissions",
        },
        {
          model: models.Subjects,
          attributes: ["subject_name"],
          as: "subject",
        },
      ],
    });
    const assignment_avg_marks = assignments.map((a) => {
      return {
        x:
          a.dataValues.submissions.reduce((acc, curr) => {
            return acc + curr.dataValues.obtained_marks;
          }, 0) / a.dataValues.submissions.length,
        y: a.dataValues.subject.dataValues.subject_name,
      };
    });
    const exam_avg_marks = exams.map((e) => {
      return {
        x:
          e.dataValues.submissions.reduce((acc, curr) => {
            return acc + curr.dataValues.obtained_marks;
          }, 0) / e.dataValues.submissions.length,
        y: e.dataValues.subject.dataValues.subject_name,
      };
    });
    const test_avg_marks = tests.map((t) => {
      return {
        x:
          t.dataValues.submissions.reduce((acc, curr) => {
            return acc + curr.dataValues.obtained_marks;
          }, 0) / t.dataValues.submissions.length,
        y: t.dataValues.subject.dataValues.subject_name,
      };
    });

    return res.status(200).json({
      message: "Academic data fetched successfully",
      assignment_avg_marks: assignment_avg_marks,
      exam_avg_marks: exam_avg_marks,
      test_avg_marks: test_avg_marks,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while fetching academic data",
      error: error.message,
    });
  }
});

module.exports = router;
