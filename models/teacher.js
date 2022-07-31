"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Teacher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Teacher.belongsTo(models.Section, {
        foreignKey: "section_id",
        as: "section",
      });
      Teacher.belongsTo(models.Class, {
        foreignKey: "class_id",
        as: "class",
      });
      Teacher.hasMany(models.PTMDetails, {
        foreignKey: "teacher_id",
        as: "PTM History",
        onDelete: "CASCADE",
        hooks: true,
      });
      Teacher.hasMany(models.Query, {
        foreignKey: "teacher_id",
        as: "Query History",
        onDelete: "CASCADE",
        hooks: true,
      });
      Teacher.hasMany(models.PasswordResetRequests, {
        foreignKey: "teacher_id",
        as: "passwordResetRequest",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }
  Teacher.init(
    {
      faculty_no: DataTypes.INTEGER,
      name: DataTypes.STRING,
      qualification: DataTypes.STRING,
      mobile_no: DataTypes.STRING,
      email: DataTypes.STRING,
      address: DataTypes.STRING,
      class_id: DataTypes.INTEGER,
      section_id: DataTypes.INTEGER,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Teacher",
    }
  );
  return Teacher;
};
