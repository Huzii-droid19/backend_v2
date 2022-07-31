"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Tests", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      marks: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      details: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      file_uri: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      deadline: {
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
      subject_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: "Subjects", key: "id" },
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
    await queryInterface.dropTable("Tests");
  },
};
