"use strict";
const { Model, ForeignKeyConstraintError } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TestSubmission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TestSubmission.belongsTo(models.Student, {
        foreignKey: "student_id",
        as: "student",
      });
      TestSubmission.belongsTo(models.Tests, {
        foreignKey: "test_id",
        as: "Test",
      });
    }
  }
  TestSubmission.init(
    {
      file_uri: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      obtained_marks: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
      test_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "TestSubmission",
    }
  );
  return TestSubmission;
};
