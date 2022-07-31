"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TeacherAttendance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      TeacherAttendance.belongsTo(models.Teacher, {
        foreignKey: "teacher_id",
        as: "Teacher",
      });

      TeacherAttendance.belongsTo(models.Admin, {
        foreignKey: "admin_id",
        as: "Admin",
      });
    }
  }
  TeacherAttendance.init(
    {
      attendance_date: DataTypes.DATE,
      status: DataTypes.BOOLEAN,
      admin_id: DataTypes.INTEGER,
      teacher_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "TeacherAttendance",
    }
  );
  return TeacherAttendance;
};
