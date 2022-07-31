const express = require("express");
const models = require("../models");
const bcrypt = require("bcrypt");
const AssignmentSubsmissionUpload = require("../store/assignmentSubmission.store");
const TestSubmissionUpload = require("../store/testSubmission.store");
const ExamSubmissionUpload = require("../store/examSubmission.store");
const fs = require("fs");
const fetch = require("node-fetch");
const sequelize = require("sequelize");

const router = express.Router();
const MODEL_PREDICT_URL = "https://binary-classifier-app.herokuapp.com/";

//login
router.post("/login", async (req, res) => {
  try {
    const { registration_no, password } = req.body;
    const student = await models.Student.findOne({
      where: { registration_no: registration_no },
    });
    if (student) {
      const validPasssword = await bcrypt.compare(password, student.password);
      if (!validPasssword) {
        return res
          .status(401)
          .json({ message: "User Not Authorized Password is incorrect" });
      }

      return res
        .status(200)
        .json({ message: "Logged in sucessfully", student: student });
    } else {
      return res.status(404).json({
        message: "User Not Found, Please Check Login Details",
        id: registration_no,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while logging In",
      error: error.message,
    });
  }
});

// update password
router.put("/updatePassword", async (req, res) => {
  try {
    const { oldPassword, newPassword, student_id } = req.body;

    const student = await models.Student.findOne({
      where: {
        id: student_id,
      },
    });
    if (student) {
      const valid = await bcrypt.compare(oldPassword, student.password);
      if (valid) {
        const hash = await bcrypt.hash(newPassword, 10);
        const updated = await models.Student.update(
          {
            password: hash,
          },
          {
            where: {
              id: student_id,
            },
          }
        );
        if (updated) {
          return res.status(200).json({
            message: "Password Updated Successfully",
            flag: true,
          });
        }
      } else {
        return res
          .status(401)
          .json({ message: "Old Password is incorrect", flag: false });
      }
    } else {
      return res.status(404).json({ message: "User Not Found", flag: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while updating password",
      error: error.message,
    });
  }
});

//student Details
router.get("/student_details/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const student = await models.Student.findOne({
      where: {
        id: id,
      },
    });
    if (student) {
      return res
        .status(200)
        .json({ message: "Student Found", student: student });
    } else {
      return res.status(401).json({
        message: `Student not found against user_id=${user_no}`,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error while fetching student details",
      error: error.message,
    });
  }
});

//all subjects
router.post("/subjects/", async (req, res) => {
  const { class_id, section_id } = req.body;
  await models.Subjects.findAll({
    where: {
      class_id: class_id,
      section_id: section_id,
    },
  })
    .then((subjects) => {
      return res
        .status(200)
        .json({ message: "Subjects Found", subjects: subjects });
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        message: "Error while fetching subjects",
        error: error.message,
      });
    });
});

//get all assignment
router.post("/assignments/", async (req, res) => {
  const { class_id, section_id, student_id } = req.body;
  await models.Assignments.findAll({
    where: {
      class_id: class_id,
      section_id: section_id,
    },
    include: [
      {
        model: models.AssignmentSubmission,
        as: "submissions",

        required: false,
        where: {
          student_id: student_id,
        },
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
          message: "Assignments not found",
          assignments: [],
        });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        message: "Error while fetching assignments",
        error: error.message,
      });
    });
});

//get all tests
router.post("/tests/", async (req, res) => {
  const { class_id, section_id, student_id } = req.body;
  await models.Tests.findAll({
    where: {
      class_id: class_id,
      section_id: section_id,
    },
    include: [
      {
        model: models.TestSubmission,
        as: "submissions",
        required: false,
        where: {
          student_id: student_id,
        },
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
          message: "Tests not found",
          tests: [],
        });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        message: "Error while fetching tests",
        error: error.message,
      });
    });
});

//get all exams
router.post("/exams/", async (req, res) => {
  const { class_id, section_id, student_id } = req.body;
  await models.Exams.findAll({
    where: {
      class_id: class_id,
      section_id: section_id,
    },
    include: [
      {
        model: models.ExamSubmission,
        as: "submissions",
        required: false,
        where: {
          student_id: student_id,
        },
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
          message: "Exams not found",
          exams: [],
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

//add assignment Submission
router.post("/submit-assignment/", async (req, res) => {
  AssignmentSubsmissionUpload(req, res, async (error) => {
    if (error) {
      return res.status(500).json({
        message: "Error while uploading assignment",
        error: error.message,
      });
    }
    const { assignment_id, student_id } = req.body;
    const path = req.file.path;
    await models.AssignmentSubmission.create({
      assignment_id: assignment_id,
      student_id: student_id,
      file_uri: path,
      status: true,
    })
      .then((assignmentSubmission) => {
        return res.status(200).json({
          message: "Assignment Submitted",
          assignmentSubmission: assignmentSubmission,
        });
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Error while uploading assignment",
          error: error.message,
        });
      });
  });
});

// download assignment submission
router.get("/download-assignment/:id", async (req, res) => {
  const { id } = req.params;
  await models.AssignmentSubmission.findOne({
    where: {
      id: id,
    },
  })
    .then((assignmentSubmission) => {
      if (assignmentSubmission) {
        res.download(assignmentSubmission.file_uri);
      } else {
        return res.status(404).json({
          message: "Assignment not found",
          assignmentSubmission: [],
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while fetching assignment",
        error: error.message,
      });
    });
});

// delete assignment submission
router.delete("/delete-assignment/:id/:student_id", async (req, res) => {
  const { id, student_id } = req.params;
  await models.AssignmentSubmission.findOne({
    where: {
      assignment_id: id,
      student_id: student_id,
    },
  })
    .then((assignmentSubmission) => {
      if (assignmentSubmission) {
        fs.stat(assignmentSubmission.file_uri, (err, stats) => {
          if (err) {
            return res.status(500).json({
              message: "Error while deleting assignment",
              error: err.message,
            });
          }
          fs.unlink(assignmentSubmission.file_uri, (err) => {
            if (err) {
              return res.status(500).json({
                message: "Error while deleting assignment",
                error: err.message,
              });
            }
            assignmentSubmission.destroy();
            return res.status(200).json({
              message: "Assignment Deleted",
              assignmentSubmission: assignmentSubmission,
            });
          });
        });
      } else {
        return res.status(404).json({
          message: "Assignment Submission not found",
          assignmentSubmission: [],
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while fetching assignment",
        error: error.message,
      });
    });
});

// add test submission
router.post("/subimt-test/", async (req, res) => {
  TestSubmissionUpload(req, res, async (error) => {
    if (error) {
      return res.status(500).json({
        message: "Error while uploading test",
        error: error.message,
      });
    }
    const { test_id, student_id } = req.body;
    const path = req.file.path;
    await models.TestSubmission.create({
      test_id: test_id,
      student_id: student_id,
      file_uri: path,
      status: true,
    })
      .then((testSubmission) => {
        return res.status(200).json({
          message: "Test Submitted",
          testSubmission: testSubmission,
        });
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Error while uploading test",
          error: error.message,
        });
      });
  });
});

// download test submission
router.get("/download-test/:id/", async (req, res) => {
  const { id } = req.params;
  await models.TestSubmission.findOne({
    where: {
      id: id,
    },
  })
    .then((testSubmission) => {
      if (testSubmission) {
        res.download(testSubmission.file_uri);
      } else {
        return res.status(404).json({
          message: "Test Submission not found",
          testSubmission: [],
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while fetching test submission",
        error: error.message,
      });
    });
});

// delete test submission
router.delete("/delete-test/:id/:student_id", async (req, res) => {
  const { id, student_id } = req.params;
  await models.TestSubmission.findOne({
    where: {
      test_id: id,
      student_id: student_id,
    },
  })
    .then((testSubmission) => {
      if (testSubmission) {
        fs.stat(testSubmission.file_uri, (err, stat) => {
          if (err) {
            return res.status(500).json({
              message: "Error while deleting test submission",
              error: err.message,
            });
          }
          fs.unlink(testSubmission.file_uri, (err) => {
            if (err) {
              return res.status(500).json({
                message: "Error while deleting test submission",
                error: err.message,
              });
            }
            testSubmission.destroy();
            return res.status(200).json({
              message: "Test Submission deleted",
            });
          });
        });
      } else {
        return res.status(404).json({
          message: "Test Submission not found",
          testSubmission: [],
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while fetching test submission",
        error: error.message,
      });
    });
});

// submit exam
router.post("/submit-exam/", async (req, res) => {
  ExamSubmissionUpload(req, res, async (error) => {
    if (error) {
      return res.status(500).json({
        message: "Error while uploading exam",
        error: error.message,
      });
    }
    const { exam_id, student_id } = req.body;
    const path = req.file.path;
    await models.ExamSubmission.create({
      exam_id: exam_id,
      student_id: student_id,
      file_uri: path,
      status: true,
    })
      .then((examSubmission) => {
        return res.status(200).json({
          message: "Exam Submitted",
          examSubmission: examSubmission,
        });
      })
      .catch((error) => {
        return res.status(500).json({
          message: "Error while uploading exam",
          error: error.message,
        });
      });
  });
});

// download exam submission
router.get("/download-exam/:id", async (req, res) => {
  const { id, student_id } = req.params;
  await models.ExamSubmission.findOne({
    where: {
      id: id,
    },
  })
    .then((examSubmission) => {
      if (examSubmission) {
        res.download(examSubmission.file_uri);
      } else {
        return res.status(404).json({
          message: "Exam Submission not found",
          examSubmission: [],
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while fetching exam submission",
        error: error.message,
      });
    });
});

// delete exam submission
router.delete("/delete-exam/:id/:student_id", async (req, res) => {
  const { id, student_id } = req.params;

  await models.ExamSubmission.findOne({
    where: {
      exam_id: id,
      student_id: student_id,
    },
  })
    .then((examSubmission) => {
      if (examSubmission) {
        fs.stat(examSubmission.file_uri, (err, stat) => {
          if (err) {
            return res.status(500).json({
              message: "Error while deleting exam submission",
              error: err.message,
            });
          }
          fs.unlink(examSubmission.file_uri, (err) => {
            if (err) {
              return res.status(500).json({
                message: "Error while deleting exam submission",
                error: err.message,
              });
            }
            examSubmission.destroy();
            return res.status(200).json({
              message: "Exam Submission deleted",
            });
          });
        });
      } else {
        return res.status(404).json({
          message: "Exam Submission not found",
          examSubmission: [],
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while fetching exam submission",
        error: error.message,
      });
    });
});

//add Query
router.post("/add-query", async (req, res) => {
  try {
    const { type, status, details, teacher_id, subject_id, student_id } =
      req.body;
    const student = await models.Student.findOne({
      where: {
        id: student_id,
      },
    });
    if (student) {
      const query = await models.Query.create({
        type: type,
        status: status,
        details: details,
        teacher_id: teacher_id,
        subject_id: subject_id,
        student_id: student_id,
      });
      return res
        .status(200)
        .json({ message: "Query added successfully", query: query });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while adding query",
      error: error.message,
    });
  }
});

// get attendance data
router.get("/get-attendance/:id", async (req, res) => {
  const { id } = req.params;
  await models.StudentAttendance.findAll({
    where: {
      student_id: id,
    },
  })
    .then((attendance) => {
      if (attendance) {
        return res.status(200).json({
          message: "Attendance fetched successfully",
          attendance: attendance,
        });
      } else {
        return res.status(404).json({
          message: "Attendance not found",
          attendance: [],
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while fetching attendance",
        error: error.message,
      });
    });
});

// get attendance data for graph
router.get("/get-attendance-graph/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const presents = await models.StudentAttendance.findAll({
      where: {
        student_id: id,
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
        student_id: id,
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

// get academic data from graph
router.get("/get-academic-graph/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const assignments = await models.AssignmentSubmission.findAll({
      where: {
        student_id: id,
      },
      attributes: ["obtained_marks"],
      include: [
        {
          model: models.Assignments,
          attributes: ["id"],
          as: "Assignment",
          include: [
            {
              model: models.Subjects,
              attributes: ["subject_name"],
              as: "subject",
            },
          ],
        },
      ],
    });
    const exams = await models.ExamSubmission.findAll({
      where: {
        student_id: id,
      },
      attributes: ["obtained_marks"],
      include: [
        {
          model: models.Exams,
          attributes: ["id"],
          as: "Exam",
          include: [
            {
              model: models.Subjects,
              attributes: ["subject_name"],
              as: "subject",
            },
          ],
        },
      ],
    });
    const tests = await models.TestSubmission.findAll({
      where: {
        student_id: id,
      },
      attributes: ["obtained_marks"],
      include: [
        {
          model: models.Tests,
          attributes: ["id"],
          as: "Test",
          include: [
            {
              model: models.Subjects,
              attributes: ["subject_name"],
              as: "subject",
            },
          ],
        },
      ],
    });
    const assignment_marks = assignments.map((e) => {
      return {
        x: e.dataValues.Assignment.subject.subject_name,
        y: e.dataValues.obtained_marks,
      };
    });
    const exam_marks = exams.map((e) => {
      return {
        x: e.dataValues.Exam.subject.subject_name,
        y: e.dataValues.obtained_marks,
      };
    });
    const test_marks = tests.map((e) => {
      return {
        x: e.dataValues.Test.subject.subject_name,
        y: e.dataValues.obtained_marks,
      };
    });

    return res.status(200).json({
      message: "Academic data fetched successfully",
      assignment_marks: assignment_marks,
      exam_marks: exam_marks,
      test_marks: test_marks,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while fetching academic data",
      error: error.message,
    });
  }
});

// subject wise academic record
router.get("/get-academic-record/:id/", async (req, res) => {
  try {
    const assignment_count = await models.Assignments.count({
      where: {
        section_id: req.params.id,
      },
    });
    const exam_count = await models.Exams.count({
      where: {
        section_id: req.params.id,
      },
    });
    const test_count = await models.Tests.count({
      where: {
        section_id: req.params.id,
      },
    });
    return res.status(200).json({
      message: "Academic data fetched successfully",
      assignment_count: assignment_count,
      exam_count: exam_count,
      test_count: test_count,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while fetching academic data",
      error: error.message,
    });
  }
});

// get assignment, test average
router.get("/predict/:id/:subject_id", async (req, res) => {
  try {
    const { id, subject_id } = req.params;

    const assignments = await models.Assignments.findAll({
      where: {
        subject_id: subject_id,
      },
      attributes: ["id", "marks"],
      include: [
        {
          model: models.AssignmentSubmission,
          attributes: ["obtained_marks"],
          as: "submissions",
          where: {
            student_id: id,
          },
        },
      ],
    });

    const tests = await models.Tests.findAll({
      where: {
        subject_id: subject_id,
      },
      attributes: ["id", "marks"],
      include: [
        {
          model: models.TestSubmission,
          attributes: ["id", "obtained_marks"],
          as: "submissions",
          where: {
            student_id: id,
          },
        },
      ],
    });
    const total_assignment_marks = assignments.reduce(
      (acc, curr) => acc + curr.dataValues.marks,
      0
    );
    const total_test_marks = tests.reduce(
      (acc, curr) => acc + curr.dataValues.marks,
      0
    );
    const assignment_obtained_marks = assignments.reduce(
      (acc, curr) => acc + curr.dataValues.submissions[0].obtained_marks,
      0
    );
    const test_obtained_marks = tests.reduce(
      (acc, curr) => acc + curr.dataValues.submissions[0].obtained_marks,
      0
    );
    const assignment_average =
      assignment_obtained_marks / total_assignment_marks;
    const test_average = test_obtained_marks / total_test_marks;

    await fetch(MODEL_PREDICT_URL, {
      method: "POST",
      body: JSON.stringify({
        assignment: assignment_average || 0,
        test: test_average || 0,
      }),
      headers: { "Content-Type": "application/json" },
    }).then((r) => {
      r.json().then((data) => {
        return res.status(200).json({
          message: "Academic data fetched successfully",
          prediction: data,
        });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while fetching academic data",
      error: error.message,
    });
  }
});

router.get("/queries/:id", async (req, res) => {
  await models.Query.findAll({
    where: {
      student_id: req.params.id,
    },
    include: [
      {
        model: models.Teacher,
        as: "teacher",
        attributes: ["id", "name"],
      },
      {
        model: models.Subjects,
        as: "subject",
        attributes: ["id", "subject_name"],
      },
    ],
  })
    .then((queries) => {
      if (queries.length > 0) {
        return res.status(200).json({
          message: "Queries Found",
          queries: queries,
        });
      } else {
        return res.status(404).json({
          message: "Queries not found",
          queries: [],
        });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        message: "Error while fetching queries",
        error: error.message,
      });
    });
});
// get class teacher
router.get("/class-teacher/:class_id/:section_id", async (req, res) => {
  await models.Teacher.findOne({
    where: {
      class_id: req.params.class_id,
      section_id: req.params.section_id,
    },
  })
    .then((classTeacher) => {
      if (classTeacher) {
        return res.status(200).json({
          message: "Class Teacher found",
          teacher: classTeacher,
        });
      } else {
        return res.status(404).json({
          message: "Class Teacher not found",
          teacher: {},
        });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        message: "Error while fetching class teacher",
        error: error.message,
      });
    });
});

// get all meetings
router.get("/meetings/:id", async (req, res) => {
  await models.PTMDetails.findAll({
    where: {
      section_id: req.params.id,
    },
    include: [
      {
        model: models.Teacher,
        as: "teacher",
        attributes: ["id", "name"],
      },
      {
        model: models.Section,
        as: "section",
        attributes: ["id", "section_name"],
      },
    ],
  })
    .then((meetings) => {
      if (meetings.length > 0) {
        return res.status(200).json({
          message: "Meetings found",
          meetings: meetings,
        });
      } else {
        return res.status(404).json({
          message: "Meetings not found",
          meetings: [],
        });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        message: "Error while fetching meetings",
        error: error.message,
      });
    });
});

// get student fee
router.get("/fee/:id", async (req, res) => {
  await models.Fee.findOne({
    where: {
      student_id: req.params.id,
    },
  })
    .then((fee) => {
      if (fee) {
        return res.status(200).json({
          message: "Fee found",
          fee: fee,
        });
      } else {
        return res.status(404).json({
          message: "Fee not found",
          fee: [],
        });
      }
    })
    .catch((error) => {
      console.error(error);
      return res.status(500).json({
        message: "Error while fetching fee",
        error: error.message,
      });
    });
});

// get fee history
router.get("/fee-history/:id", async (req, res) => {
  await models.Fee.findAll({
    where: {
      student_id: req.params.id,
    },
  }).then((fee) => {
    if (fee.length > 0) {
      return res.status(200).json({
        message: "Fee history found",
        fee: fee,
      });
    } else {
      return res.status(404).json({
        message: "Fee history not found",
        fee: [],
      });
    }
  });
});

// get test average
router.get("/test-average/:id", async (req, res) => {
  await models.TestSubmission.findAll({
    where: {
      student_id: req.params.id,
    },
    include: [
      {
        model: models.Tests,
        as: "Test",
        attributes: ["id", "title", "marks"],
        include: [
          {
            model: models.Subjects,
            as: "subject",
            attributes: ["id", "subject_name"],
          },
        ],
      },
    ],
  })
    .then((test) => {
      if (test.length > 0) {
        const average = test.map((t) => {
          const temp = {
            test_id: t.Test.id,
            test_title: t.Test.title,
            subject_id: t.Test.subject.id,
            subject_name: t.Test.subject.subject_name,
            average: t.obtained_marks / t.Test.marks,
          };
          return temp;
        });
        return res.status(200).json({
          message: "Test average found",
          average: average,
        });
      } else {
        return res.status(404).json({
          message: "Test average not found",
          average: [],
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while calculating average for test marks",
        error: error.message,
      });
    });
});

// assignment average
router.get("/assignment-average/:id", async (req, res) => {
  await models.AssignmentSubmission.findAll({
    where: {
      student_id: req.params.id,
    },
    include: [
      {
        model: models.Assignments,
        as: "Assignment",
        attributes: ["id", "title", "marks"],
        include: [
          {
            model: models.Subjects,
            as: "subject",
            attributes: ["id", "subject_name"],
          },
        ],
      },
    ],
  })
    .then((assignments) => {
      if (assignments.length > 0) {
        const average = assignments.map((a) => {
          const temp = {
            assignment_id: a.Assignment.id,
            assignment_title: a.Assignment.title,
            subject_id: a.Assignment.subject.id,
            subject_name: a.Assignment.subject.subject_name,
            average: a.obtained_marks / a.Assignment.marks,
          };
          return temp;
        });
        return res.status(200).json({
          message: "Average Calculated Successfully",
          average: average,
        });
      } else {
        return res.status(404).json({
          message: "Assignment submission not found",
          average: [],
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while calculating average for assignments",
        error: error.message,
      });
    });
});

// exam average
router.get("/exam-average/:id", async (req, res) => {
  await models.ExamSubmission.findAll({
    where: {
      student_id: req.params.id,
    },
    include: [
      {
        model: models.Exams,
        as: "Exam",
        attributes: ["id", "title", "marks"],
        include: [
          {
            model: models.Subjects,
            as: "subject",
            attributes: ["id", "subject_name"],
          },
        ],
      },
    ],
  })
    .then((exams) => {
      if (exams.length > 0) {
        const average = exams.map((e) => {
          const temp = {
            exam_id: e.Exam.id,
            exam_title: e.Exam.title,
            subject_id: e.Exam.subject.id,
            subject_name: e.Exam.subject.subject_name,
            average: e.obtained_marks / e.Exam.marks,
          };
          return temp;
        });
        return res.status(200).json({
          message: "Average Calculated Successfully",
          average: average,
        });
      } else {
        return res.status(404).json({
          message: "Exam submission not found",
          average: [],
        });
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error while calculating average for exams",
        error: error.message,
      });
    });
});

module.exports = router;
