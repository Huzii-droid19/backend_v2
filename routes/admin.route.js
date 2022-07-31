const express = require("express");
const models = require("../models");
const generator = require("generate-serial-number");
const bcrypt = require("bcrypt");
const sendEmail = require("./sendemail");

const router = express.Router();

// admin login
router.post("/login", async (req, res) => {
  try {
    const { adminNo, password } = req.body;
    await models.Admin.findOne({
      where: {
        admin_no: adminNo,
      },
    }).then((admin) => {
      if (admin) {
        bcrypt.compare(password, admin.password).then((result) => {
          if (result) {
            return res.status(200).json({
              login: true,
              message: "Admin Found",
              admin: admin,
            });
          } else {
            return res.status(401).json({
              login: false,
              message: "Please Provide Correct Password",
              id: adminNo,
            });
          }
        });
      } else {
        return res.status(404).json({
          login: false,
          message: "Admin Not Found",
          id: adminNo,
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      login: false,
      message: "Internal Server Error while logging In",
      error: error.message,
    });
  }
});

// get-- all admins
router.get("/", async (req, res) => {
  try {
    await models.Admin.findAll().then((admins) => {
      if (admins) {
        return res.status(200).json({
          admins: admins,
        });
      } else {
        return res.status(404).json({
          admins: null,
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      admins: null,
      message: "Internal Server Error while getting all admins",
      error: error.message,
    });
  }
});

// add admin
router.post("/add-admin", async (req, res) => {
  try {
    const { name, mobile_no, address, email, password } = req.body;
    const adminNo = generator.generate(5);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await models.Admin.create({
      admin_no: adminNo,
      name: name,
      mobile_no: mobile_no,
      address: address,
      email: email,
      password: hashedPassword,
    }).then((admin) => {
      return res.status(200).json({
        message: "Admin Added Successfully",
        admin: admin,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error while adding Admin",
      error: error.message,
    });
  }
});

// get admin details
router.get("/details/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await models.Admin.findOne({
      where: {
        id: id,
      },
    });
    if (admin) {
      return res.status(200).json({ details: admin });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error while feteching Admin details",
      error: error.message,
    });
  }
});

// send reset code
router.post("/send-reset-code", async (req, res) => {
  try {
    const { adminNo, email } = req.body;
    const code = generator.generate({
      length: 6,
      numbers: true,
    });
    await models.Admin.findOne({
      where: {
        admin_no: adminNo,
      },
    }).then((admin) => {
      if (admin) {
        if (admin.email === email) {
          sendEmail(email, code);
          return res.status(200).json({
            message: "Code Sent Successfully",
          });
        } else {
          return res.status(401).json({
            message: "Email Does Not Match",
          });
        }
      } else {
        return res.status(404).json({
          message: "Admin Not Found",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error while sending code",
      error: error.message,
    });
  }
});

// forget password
router.post("/forget-password", async (req, res) => {
  try {
    const { code } = req.body;
    await models.PasswordResetRequest.findOne({
      where: {
        code: code,
      },
    }).then((passwordResetRequest) => {
      if (passwordResetRequest) {
        return res.status(200).json({
          message: "Code Found",
          passwordResetRequest: passwordResetRequest,
        });
      } else {
        return res.status(404).json({
          message: "Code Not Found",
        });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error while logging In",
      error: error.message,
    });
  }
});

// Dashboard Routes
router.get("/all-record", async (req, res) => {
  try {
    const students = await models.Student.count();
    const teachers = await models.Teacher.count();
    const classes = await models.Class.count();
    const sections = await models.Section.count();
    return res.status(200).json({
      record: {
        total_students: students,
        total_teachers: teachers,
        total_classes: classes,
        total_sections: sections,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error While Fetching All Records",
    });
  }
});

// Student Routes

//add student
router.post("/add-student", async (req, res) => {
  try {
    const {
      name,
      father_name,
      mobile_no,
      email,
      address,
      class_id,
      section_id,
    } = req.body;

    const registration_no = generator.generate(5);
    const hash_password = await bcrypt.hash(
      process.env.initial_student_password,
      10
    );
    const student = await models.Student.findOne({
      where: { registration_no: registration_no },
    });
    if (!student) {
      const new_student = await models.Student.create({
        registration_no: registration_no,
        name: name,
        father_name: father_name,
        mobile_no: mobile_no,
        email: email,
        address: address,
        status: true,
        class_id: class_id,
        section_id: section_id,
        password: hash_password,
      });
      return res.status(200).json({
        message: "Student added successfully",
        student: new_student,
      });
    } else {
      return res
        .status(401)
        .json(
          `Student with Registration number ${registration_no} already exists`
        );
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while adding student",
      error: error.message,
    });
  }
});

// get all students
router.post("/get-all-students/", async (req, res) => {
  const { class_id, section_id } = req.body;
  try {
    const students = await models.Student.findAll({
      include: [
        {
          model: models.Class,
          as: "class",
          attributes: ["id", "class_name"],
        },
        {
          model: models.Section,
          as: "section",
          attributes: ["id", "section_name"],
        },
      ],
      where: {
        class_id: class_id,
        section_id: section_id,
      },
    });
    if (students.length > 0) {
      return res.status(200).json({
        message: "Students fetched successfully",
        students: students,
      });
    } else {
      return res.status(404).json({
        message: "No students found",
        students: [],
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while fetching students",
      error: error.message,
    });
  }
});

// get all students
router.get("/get-all-students/", async (req, res) => {
  try {
    await models.Student.findAll({
      include: [
        {
          model: models.Class,
          as: "class",
          attributes: ["id", "class_name"],
        },
        {
          model: models.Section,
          as: "section",
          attributes: ["id", "section_name"],
        },
      ],
    }).then((students) => {
      return res.status(200).json({
        message: "Students fetched successfully",
        students: students,
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while fetching students",
      error: error.message,
    });
  }
});

// update Student
router.put("/update-student", async (req, res) => {
  const {
    id,
    name,
    father_name,
    mobile_no,
    email,
    address,
    class_id,
    section_id,
  } = req.body;
  try {
    const student = await models.Student.findOne({
      where: { id: id },
    });
    if (student) {
      await student.update({
        name: name,
        father_name: father_name,
        mobile_no: mobile_no,
        email: email,
        address: address,
        class_id: class_id,
        section_id: section_id,
      });
      return res.status(200).json({
        message: "Student updated successfully",
        student: student,
      });
    } else {
      return res.status(401).json({
        message: "Student not found",
        student: [],
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while updating student",
      error: error.message,
    });
  }
});

// delete Student
router.put("/delete-student/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const student = await models.Student.findOne({
      where: { id: id },
    });
    if (student) {
      await student.destroy();
      return res.status(200).json({
        message: "Student deleted successfully",
      });
    } else {
      return res.status(401).json({
        message: "Student not found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while deleting student",
      error: error.message,
    });
  }
});

// deactive student
router.put("/deactivate", async (req, res) => {
  try {
    const { id, status } = req.body;
    const student = await models.Student.findOne({
      where: { id: id },
    });
    if (student) {
      await student.update({
        status: status,
      });
      return res.status(200).json({
        message: "Student deactivated successfully",
      });
    } else {
      return res.status(401).json({
        message: "Student not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while deactivating student",
      error: error.message,
    });
  }
});

// add teacher
router.post("/add-teacher", async (req, res) => {
  try {
    const {
      name,
      qualification,
      mobile_no,
      email,
      address,
      section_id,
      class_id,
    } = req.body;
    const faculty_no = generator.generate(5);
    const hash_password = await bcrypt.hash(
      process.env.initial_teacher_password,
      10
    );
    const teacher = await models.Teacher.findOne({
      where: { faculty_no: faculty_no },
    });
    if (!teacher) {
      const new_teacher = await models.Teacher.create({
        faculty_no: faculty_no,
        name: name,
        qualification: qualification,
        mobile_no: mobile_no,
        email: email,
        address: address,
        section_id: section_id,
        class_id: class_id,
        password: hash_password,
      });
      return res.status(200).json({
        message: "Teacher added successfully",
        teacher: new_teacher,
      });
    } else {
      return res
        .status(401)
        .json(`Teacher with Faculty number ${faculty_no} already exists`);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while adding teacher",
      error: error.message,
    });
  }
});

// get all teachers
router.get("/get-all-teachers", async (req, res) => {
  try {
    const teachers = await models.Teacher.findAll({
      include: [
        {
          model: models.Section,
          as: "section",
          attributes: ["id", "section_name"],
        },
        {
          model: models.Class,
          as: "class",
          attributes: ["id", "class_name"],
        },
      ],
    });
    if (teachers.length > 0) {
      return res.status(200).json({
        message: "Teachers fetched successfully",
        teachers: teachers,
      });
    } else {
      return res.status(404).json({
        message: "No teachers found",
        teachers: [],
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while fetching teachers",
      error: error.message,
    });
  }
});

// get all teachers based on class and section
router.post("/get-all-teachers", async (req, res) => {
  try {
    const { section_id, class_id } = req.body;
    const teachers = await models.Teacher.findAll({
      where: {
        section_id: section_id,
        class_id: class_id,
      },
      include: [
        {
          model: models.Section,
          as: "section",
          attributes: ["id", "section_name"],
        },
        {
          model: models.Class,
          as: "class",
          attributes: ["id", "class_name"],
        },
      ],
    });
    if (teachers.length > 0) {
      return res
        .status(200)
        .json({ messgae: "Teachers fetched Successfully", teachers: teachers });
    } else {
      return res.status(404).json({ message: "No teachers found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while fetching teachers",
      error: error.message,
    });
  }
});

// update teacher
router.put("/update-teacher", async (req, res) => {
  try {
    const {
      name,
      qualification,
      mobileNo,
      email,
      address,
      section_id,
      class_id,
      id,
    } = req.body;
    const update_teacher = await models.Teacher.update(
      {
        name: name,
        qualification: qualification,
        mobile_no: mobileNo,
        email: email,
        address: address,
        section_id: section_id,
        class_id: class_id,
      },
      { where: { id: id } }
    );
    if (update_teacher) {
      return res.status(200).json({
        message: "Teacher updated successfully",
        teacher: update_teacher,
      });
    } else {
      return res.status(401).json({ message: "Teacher not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while updating teacher",
      error: error.message,
    });
  }
});

// delete teacher
router.delete("/delete-teacher/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const delete_teacher = await models.Teacher.destroy({
      where: { id: id },
    });
    if (delete_teacher) {
      return res.status(200).json({
        message: "Teacher deleted successfully",
        teacher: delete_teacher,
      });
    } else {
      return res.status(401).json({ message: "Teacher not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error while deleting teacher",
      error: error.message,
    });
  }
});

// add class
router.post("/add-class", async (req, res) => {
  try {
    const class_name = req.body.class_name;
    const new_class = await models.Class.create({
      class_name: class_name,
    });
    return res
      .status(200)
      .json({ message: "Class added successfully", class: new_class });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error while adding class",
      error: error.message,
    });
  }
});

//get all classes
router.get("/class-details", async (req, res) => {
  try {
    const classes = await models.Class.findAll({
      attributes: ["id", "class_name"],
      include: [
        {
          model: models.Section,
          as: "Section",
          attributes: ["section_name"],
        },
      ],
    });
    if (classes.length > 0) {
      res.status(200).json({
        message: "Classes fetched successfully",
        classes: classes,
      });
    } else {
      res.status(404).json({
        message: "No classes found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while fetching classes",
      error: error.message,
    });
  }
});

// update class
router.put("/update-class", async (req, res) => {
  try {
    const { id, class_name } = req.body;
    const updated_class = await models.Class.update(
      {
        class_name: class_name,
      },
      {
        where: {
          id: id,
        },
      }
    );
    if (updated_class) {
      return res.status(200).json({
        message: "Class updated successfully",
        class: updated_class,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while updating class",
      error: error.message,
    });
  }
});

//delete class
router.delete("/delete-class/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await models.Class.destroy({
      where: {
        id: id,
      },
    });
    return res.status(200).json({
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while deleting class",
      error: error.message,
    });
  }
});

// add subject
router.post("/add-subject", async (req, res) => {
  try {
    const { subject_name, section_id, class_id } = req.body;
    await models.Subjects.create({
      subject_name: subject_name,
      section_id: section_id,
      class_id: class_id,
    }).then((subject) => {
      return res.status(200).json({
        message: "Subject added successfully",
        subject: subject,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while adding subject",
      error: error.message,
    });
  }
});

// get all subjects
router.get("/get-all-subjects", async (req, res) => {
  try {
    const subjects = await models.Subjects.findAll({
      attributes: ["id", "subject_name"],
      include: [
        {
          model: models.Section,
          as: "section",
          attributes: ["id", "section_name"],
        },
        {
          model: models.Class,
          as: "class",
          attributes: ["id", "class_name"],
        },
      ],
    });
    if (subjects.length > 0) {
      res.status(200).json({
        message: "Subjects fetched successfully",
        subjects: subjects,
      });
    } else {
      res.status(404).json({
        message: "No subjects found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while fetching subjects",
      error: error.message,
    });
  }
});

// update subject
router.put("/update-subject", async (req, res) => {
  try {
    const { id, subject_name, section_id, class_id } = req.body;
    await models.Subjects.update(
      {
        subject_name: subject_name,
        section_id: section_id,
        class_id: class_id,
      },
      {
        where: {
          id: id,
        },
      }
    ).then((subject) => {
      return res.status(200).json({
        message: "Subject updated successfully",
        subject: subject,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while updating subject",
      error: error.message,
    });
  }
});

// delete subject
router.delete("/delete-subject/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await models.Subjects.destroy({
      where: {
        id: id,
      },
    }).then((subject) => {
      return res.status(200).json({
        message: "Subject deleted successfully",
        subject: subject,
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while deleting subject",
      error: error.message,
    });
  }
});

// add section
router.post("/add-section", async (req, res) => {
  try {
    const { section_name, class_id } = req.body;
    const section = await models.Section.create({
      section_name: section_name,
      class_id: class_id,
    });
    return res.status(200).json({
      message: "Section added successfully",
      section: section,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while adding section",
      error: error.message,
    });
  }
});

// get all sections
router.get("/section-details", async (req, res) => {
  try {
    const sections = await models.Section.findAll({
      attributes: ["id", "section_name", "class_id"],
      include: [
        {
          model: models.Class,
          as: "class",
          attributes: ["id", "class_name"],
        },
        {
          model: models.Teacher,
          as: "teacher",
          attributes: ["id", "name"],
        },
      ],
    });
    if (sections.length > 0) {
      res.status(200).json({
        message: "Sections fetched successfully",
        sections: sections,
      });
    } else {
      res.status(404).json({
        message: "No sections found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while fetching sections",
      error: error.message,
    });
  }
});

// get all sections based on class_id
router.get("/section-details/:class_id", async (req, res) => {
  try {
    const class_id = req.params.class_id;
    const sections = await models.Section.findAll({
      attributes: ["id", "section_name"],
      where: {
        class_id: class_id,
      },
      include: [
        {
          model: models.Teacher,
          as: "teacher",
          attributes: ["id", "name"],
        },
        {
          model: models.Class,
          as: "class",
          attributes: ["id", "class_name"],
        },
      ],
    });
    if (sections.length > 0) {
      res.status(200).json({
        message: "Sections fetched successfully",
        sections: sections,
      });
    } else {
      res.status(404).json({
        message: "No sections found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while fetching sections",
      error: error.message,
    });
  }
});

// update section
router.put("/update-section", async (req, res) => {
  try {
    const { id, section_name, class_id } = req.body;
    const updated_section = await models.Section.update(
      {
        section_name: section_name,
        class_id: class_id, // class_id is foreign key
      },
      {
        where: {
          id: id,
        },
      }
    );
    if (updated_section) {
      return res.status(200).json({
        message: "Section updated successfully",
        section: updated_section,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while updating section",
      error: error.message,
    });
  }
});

// delete section
router.delete("/delete-section/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await models.Section.destroy({
      where: {
        id: id,
      },
    });
    return res.status(200).json({
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while deleting section",
      error: error.message,
    });
  }
});

// mark attendance
router.post("/mark-teacher-attendance", async (req, res) => {
  try {
    const { attendance_data, date, admin_id } = req.body;
    attendance_data.forEach(async (element) => {
      const attendance = await models.TeacherAttendance.create({
        teacher_id: element.teacher_id,
        status: element.attendance_status,
        admin_id: admin_id,
        attendance_date: date,
      });
    });
    return res.status(200).json({
      message: "Attendance marked successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while marking attendance",
      error: error.message,
    });
  }
});

// add fee
router.post("/add-fee", async (req, res) => {
  const { amount, student_id, status, month } = req.body;
  console.log(req.body);
  await models.Fee.create({
    fee_amount: parseInt(amount),
    student_id: student_id,
    status: status,
    month: month,
  }).then((fee) => {
    return res.status(200).json({
      message: "Fee added successfully",
      fee: fee,
    });
  });
});

// update teacher password
router.put("/update-teacher-password", async (req, res) => {
  try {
    const { id } = req.body;
    const updated_teacher = await models.Teacher.update(
      {
        password: bcrypt.hashSync(process.env.initial_teacher_password, 10),
      },
      {
        where: {
          id: id,
        },
      }
    );
    if (updated_teacher) {
      return res.status(200).json({
        message: "Teacher password updated successfully",
        teacher: updated_teacher,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while updating teacher password",
      error: error.message,
    });
  }
});

// update student password
router.put("/update-student-password", async (req, res) => {
  try {
    const { id } = req.body;
    const updated_student = await models.Student.update(
      {
        password: bcrypt.hashSync(process.env.initial_student_password, 10),
      },
      {
        where: {
          id: id,
        },
      }
    );
    if (updated_student) {
      return res.status(200).json({
        message: "Student password updated successfully",
        student: updated_student,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error while updating student password",
      error: error.message,
    });
  }
});

module.exports = router;
