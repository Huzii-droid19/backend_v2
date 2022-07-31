"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tests extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Tests.belongsTo(models.Section, {
        foreignKey: "section_id",
        as: "section",
      });
      Tests.belongsTo(models.Class, {
        foreignKey: "class_id",
        as: "class",
      });
      Tests.belongsTo(models.Subjects, {
        foreignKey: "subject_id",
        as: "subject",
      });
      Tests.hasMany(models.TestSubmission, {
        foreignKey: "test_id",
        as: "submissions",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }
  Tests.init(
    {
      title: DataTypes.STRING,
      marks: DataTypes.INTEGER,
      details: DataTypes.STRING,
      file_uri: DataTypes.STRING,
      deadline: DataTypes.DATE,
      class_id: DataTypes.INTEGER,
      section_id: DataTypes.INTEGER,
      subject_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Tests",
    }
  );
  return Tests;
};
