"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Fee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Fee.belongsTo(models.Student, {
        foreignKey: "student_id",
        as: "Student",
      });
    }
  }
  Fee.init(
    {
      month: DataTypes.STRING,
      fee_amount: DataTypes.DECIMAL,
      status: DataTypes.BOOLEAN,
      student_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Fee",
    }
  );
  return Fee;
};
