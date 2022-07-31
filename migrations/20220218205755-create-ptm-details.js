"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("PTMDetails", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      meet_link: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      ptm_date: {
        allowNull: false,
        type: Sequelize.DATE,
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
      teacher_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Teachers", key: "id" },
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
    await queryInterface.dropTable("PTMDetails");
  },
};
