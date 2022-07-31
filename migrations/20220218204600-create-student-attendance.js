"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("StudentAttendances", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      attendance_date: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      status: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
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
      student_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Students", key: "id" },
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
    await queryInterface.dropTable("StudentAttendances");
  },
};
