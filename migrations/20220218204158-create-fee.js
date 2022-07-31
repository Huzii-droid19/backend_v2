"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Fees", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      month: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      fee_amount: {
        allowNull: false,
        type: Sequelize.DECIMAL,
      },
      status: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable("Fees");
  },
};
