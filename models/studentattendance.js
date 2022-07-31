"use strict";
const { Model } = require("sequelize");
const router = require("../routes/student.route");
module.exports = (sequelize, DataTypes) => {
  class StudentAttendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      StudentAttendance.belongsTo(models.Section, {
        foreignKey: "section_id",
        as: "Section",
      });
      StudentAttendance.belongsTo(models.Student, {
        foreignKey: "student_id",
        as: "Student",
      });
      StudentAttendance.belongsTo(models.Class, {
        foreignKey: "class_id",
        as: "Class",
      });
    }
  }
  StudentAttendance.init(
    {
      attendance_date: DataTypes.DATE,
      status: DataTypes.BOOLEAN,
      section_id: DataTypes.INTEGER,
      class_id: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "StudentAttendance",
    }
  );
  return StudentAttendance;
};
