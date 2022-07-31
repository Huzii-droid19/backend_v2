"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Subjects extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Subjects.belongsTo(models.Section, {
        foreignKey: "section_id",
        as: "section",
      });
      Subjects.belongsTo(models.Class, { foreignKey: "class_id", as: "class" });
      Subjects.hasMany(models.Tests, {
        foreignKey: "subject_id",
        as: "tests",
        onDelete: "CASCADE",
        hooks: true,
      });
      Subjects.hasMany(models.Assignments, {
        foreignKey: "subject_id",
        as: "Assignments",
        onDelete: "CASCADE",
        hooks: true,
      });
      Subjects.hasMany(models.Exams, {
        foreignKey: "subject_id",
        as: "Exams",
        onDelete: "CASCADE",
        hooks: true,
      });
      Subjects.hasMany(models.Query, {
        foreignKey: "subject_id",
        as: "Query History",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }
  Subjects.init(
    {
      subject_name: DataTypes.STRING,
      section_id: DataTypes.INTEGER,
      class_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Subjects",
    }
  );
  return Subjects;
};
