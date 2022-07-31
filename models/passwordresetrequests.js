"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PasswordResetRequests extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PasswordResetRequests.belongsTo(models.Student, {
        foreignKey: "student_id",
        as: "student",
      });
      PasswordResetRequests.belongsTo(models.Teacher, {
        foreignKey: "teacher_id",
        as: "teacher",
      });
      PasswordResetRequests.belongsTo(models.Admin, {
        foreignKey: "admin_id",
        as: "admin",
      });
    }
  }
  PasswordResetRequests.init(
    {
      role: DataTypes.STRING,
      code: DataTypes.INTEGER,
      student_id: DataTypes.INTEGER,
      teacher_id: DataTypes.INTEGER,
      admin_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "PasswordResetRequests",
    }
  );
  return PasswordResetRequests;
};
