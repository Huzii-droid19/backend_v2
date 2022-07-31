"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Admin.hasMany(models.PasswordResetRequests, {
        foreignKey: "admin_id",
        as: "passwordResetRequest",
        onDelete: "CASCADE",
        hooks: true,
      });
      Admin.hasOne(models.TeacherAttendance, {
        foreignKey: "admin_id",
        as: "teacherAttendance",
      });
    }
  }
  Admin.init(
    {
      admin_no: DataTypes.INTEGER,
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      mobile_no: DataTypes.STRING,
      address: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Admin",
    }
  );
  return Admin;
};
