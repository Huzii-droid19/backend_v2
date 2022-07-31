"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AssignmentSubmissions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      file_uri: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      status: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      obtained_marks: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      student_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Students", key: "id" },
        onDelete: "CASCADE",
      },

      assignment_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Assignments", key: "id" },
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
    await queryInterface.dropTable("AssignmentSubmissions");
  },
};
