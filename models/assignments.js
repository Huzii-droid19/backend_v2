"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Assignments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Assignments.belongsTo(models.Section, {
        foreignKey: "section_id",
        as: "section",
      });
      Assignments.belongsTo(models.Class, {
        foreignKey: "class_id",
        as: "class",
      });
      Assignments.belongsTo(models.Subjects, {
        foreignKey: "subject_id",
        as: "subject",
      });
      Assignments.hasMany(models.AssignmentSubmission, {
        foreignKey: "assignment_id",
        as: "submissions",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }
  Assignments.init(
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
      modelName: "Assignments",
    }
  );
  return Assignments;
};
