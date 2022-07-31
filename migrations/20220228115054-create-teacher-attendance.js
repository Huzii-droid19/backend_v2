"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("TeacherAttendances", {
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
      teacher_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Teachers",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      admin_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "Admins",
          key: "id",
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
    await queryInterface.dropTable("TeacherAttendances");
  },
};
