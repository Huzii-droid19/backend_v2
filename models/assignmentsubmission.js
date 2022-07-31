"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AssignmentSubmission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AssignmentSubmission.belongsTo(models.Student, {
        foreignKey: "student_id",
        as: "Student",
      });

      AssignmentSubmission.belongsTo(models.Assignments, {
        foreignKey: "assignment_id",
        as: "Assignment",
      });
    }
  }
  AssignmentSubmission.init(
    {
      file_uri: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      obtained_marks: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
      assignment_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "AssignmentSubmission",
    }
  );
  return AssignmentSubmission;
};
