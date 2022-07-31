"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PasswordResetRequests", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      role: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      code: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      student_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "Students",
          key: "id",
          onDelete: "CASCADE",
        },
      },
      teacher_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "Teachers",
          key: "id",
          onDelete: "CASCADE",
        },
      },
      admin_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: "Admins",
          key: "id",
          onDelete: "CASCADE",
        },
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
    await queryInterface.dropTable("PasswordResetRequests");
  },
};
