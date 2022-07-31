"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Teachers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      faculty_no: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      qualification: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      mobile_no: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      section_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Sections",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      class_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Classes",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Teachers");
  },
};
