"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Class extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      Class.hasMany(models.Section, {
        foreignKey: "class_id",
        as: "Section",
        onDelete: "CASCADE",
        hooks: true,
      });
      Class.hasMany(models.Teacher, {
        foreignKey: "class_id",
        as: "Teachers",
        onDelete: "CASCADE",
        hooks: true,
      });
      Class.hasMany(models.Student, {
        foreignKey: "class_id",
        as: "Students",
        onDelete: "CASCADE",
        hooks: true,
      });
      Class.hasMany(models.StudentAttendance, {
        foreignKey: "class_id",
        as: "StudentAttendance",
        onDelete: "CASCADE",
        hooks: true,
      });
      Class.hasMany(models.Subjects, {
        foreignKey: "class_id",
        as: "Subjects",
        onDelete: "CASCADE",
        hooks: true,
      });
      Class.hasMany(models.Tests, {
        foreignKey: "class_id",
        as: "Tests",
        onDelete: "CASCADE",
        hooks: true,
      });
      Class.hasMany(models.Assignments, {
        foreignKey: "class_id",
        as: "Assignments",
        onDelete: "CASCADE",
        hooks: true,
      });
      Class.hasMany(models.Exams, {
        foreignKey: "class_id",
        as: "Exams",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }
  Class.init(
    {
      class_name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Class",
    }
  );
  return Class;
};
