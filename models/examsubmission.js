"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ExamSubmission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ExamSubmission.belongsTo(models.Student, {
        foreignKey: "student_id",
        as: "Student",
      });
      ExamSubmission.belongsTo(models.Exams, {
        foreignKey: "exam_id",
        as: "Exam",
      });
    }
  }
  ExamSubmission.init(
    {
      file_uri: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      obtained_marks: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
      exam_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ExamSubmission",
    }
  );
  return ExamSubmission;
};
