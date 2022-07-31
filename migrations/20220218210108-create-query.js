"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Queries", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      status: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      details: {
        allowNull: false,

        type: Sequelize.STRING,
      },
      response: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      teacher_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Teachers", key: "id" },
        onDelete: "CASCADE",
      },
      subject_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Subjects", key: "id" },
        onDelete: "CASCADE",
      },
      student_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Students", key: "id" },
        onDelete: "CASCADE",
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
    await queryInterface.dropTable("Queries");
  },
};
