"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Student.belongsTo(models.Section, {
        foreignKey: "section_id",
        as: "section",
      });
      Student.belongsTo(models.Class, {
        foreignKey: "class_id",
        as: "class",
      });
      Student.hasMany(models.ExamSubmission, {
        foreignKey: "student_id",
        as: "examsubmissions",
        onDelete: "CASCADE",
        hooks: true,
      });
      Student.hasMany(models.AssignmentSubmission, {
        foreignKey: "student_id",
        as: "assignmentsubmissions",
        onDelete: "CASCADE",
        hooks: true,
      });
      Student.hasMany(models.TestSubmission, {
        foreignKey: "student_id",
        as: "testsubmissions",
        onDelete: "CASCADE",
        hooks: true,
      });
      Student.hasMany(models.StudentAttendance, {
        foreignKey: "student_id",
        as: "Attendance History",
        onDelete: "CASCADE",
        hooks: true,
      });
      Student.hasMany(models.Fee, {
        foreignKey: "student_id",
        as: "fee_history",
        onDelete: "CASCADE",
        hooks: true,
      });
      Student.hasMany(models.Query, {
        foreignKey: "student_id",
        as: "Query History",
        onDelete: "CASCADE",
        hooks: true,
      });
      Student.hasMany(models.PasswordResetRequests, {
        foreignKey: "student_id",
        as: "passwordResetRequest",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }
  Student.init(
    {
      registration_no: DataTypes.INTEGER,
      name: DataTypes.STRING,
      father_name: DataTypes.STRING,
      mobile_no: DataTypes.STRING,
      email: DataTypes.STRING,
      address: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      section_id: DataTypes.INTEGER,
      class_id: DataTypes.INTEGER,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Student",
    }
  );
  return Student;
};
