"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Subjects", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      subject_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      section_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Sections", key: "id" },
        onDelete: "CASCADE",
      },
      class_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Classes", key: "id" },
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
    await queryInterface.dropTable("Subjects");
  },
};
