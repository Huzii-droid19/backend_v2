"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PTMDetails extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PTMDetails.belongsTo(models.Teacher, {
        foreignKey: "teacher_id",
        as: "teacher",
      });
      PTMDetails.belongsTo(models.Section, {
        foreignKey: "section_id",
        as: "section",
      });
    }
  }
  PTMDetails.init(
    {
      meet_link: DataTypes.STRING,
      ptm_date: DataTypes.DATE,
      section_id: DataTypes.INTEGER,
      teacher_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "PTMDetails",
    }
  );
  return PTMDetails;
};
