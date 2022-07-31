"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Section extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Section.belongsTo(models.Class, { foreignKey: "class_id", as: "class" });
      Section.hasMany(models.Student, {
        foreignKey: "section_id",
        as: "Student",
        onDelete: "CASCADE",
        hooks: true,
      });
      Section.hasMany(models.Teacher, {
        foreignKey: "section_id",
        as: "teacher",
        onDelete: "CASCADE",
        hooks: true,
      });
      Section.hasMany(models.Subjects, {
        foreignKey: "section_id",
        as: "Subjects",
        onDelete: "CASCADE",
        hooks: true,
      });
      Section.hasMany(models.Assignments, {
        foreignKey: "section_id",
        as: "Assignments",
        onDelete: "CASCADE",
        hooks: true,
      });
      Section.hasMany(models.Exams, {
        foreignKey: "section_id",
        as: "Exams",
        onDelete: "CASCADE",
        hooks: true,
      });
      Section.hasMany(models.Tests, {
        foreignKey: "section_id",
        as: "Tests",
        onDelete: "CASCADE",
        hooks: true,
      });
      Section.hasMany(models.StudentAttendance, {
        foreignKey: "section_id",
        as: "Attendance History",
        onDelete: "CASCADE",
        hooks: true,
      });
      Section.hasMany(models.PTMDetails, {
        foreignKey: "section_id",
        as: "PTM History",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }
  Section.init(
    {
      section_name: DataTypes.STRING,
      class_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Section",
    }
  );
  return Section;
};
