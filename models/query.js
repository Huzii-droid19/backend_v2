"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Query extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Query.belongsTo(models.Subjects, {
        foreignKey: "subject_id",
        as: "subject",
      });
      Query.belongsTo(models.Student, {
        foreignKey: "student_id",
        as: "student",
      });
      Query.belongsTo(models.Teacher, {
        foreignKey: "teacher_id",
        as: "teacher",
      });
    }
  }
  Query.init(
    {
      type: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      details: DataTypes.STRING,
      response: DataTypes.STRING,
      student_id: DataTypes.INTEGER,
      teacher_id: DataTypes.INTEGER,
      subject_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Query",
    }
  );
  return Query;
};
