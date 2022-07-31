"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Exams extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Exams.belongsTo(models.Section, {
        foreignKey: "section_id",
        as: "section",
      });
      Exams.belongsTo(models.Subjects, {
        foreignKey: "subject_id",
        as: "subject",
      });
      Exams.hasMany(models.ExamSubmission, {
        foreignKey: "exam_id",
        as: "submissions",
        onDelete: "CASCADE",
        hooks: true,
      });
      Exams.belongsTo(models.Class, {
        foreignKey: "class_id",
        as: "class",
      });
    }
  }
  Exams.init(
    {
      title: DataTypes.STRING,
      marks: DataTypes.INTEGER,
      details: DataTypes.STRING,
      file_uri: DataTypes.STRING,
      deadline: DataTypes.DATE,
      section_id: DataTypes.INTEGER,
      class_id: DataTypes.INTEGER,
      subject_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Exams",
    }
  );
  return Exams;
};
