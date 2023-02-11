'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('vcr_cabs1', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      cabType: {
        type: DataTypes.ENUM('Sedan', 'SUVErtiga', 'Innova', 'InnovaCrysta')
      },
      image: DataTypes.STRING,
      ac: DataTypes.CHAR,
      bags: DataTypes.INTEGER,
      capacity: DataTypes.INTEGER,
      cars: DataTypes.STRING,
      note: DataTypes.STRING,
      rate: DataTypes.INTEGER,
      returnTripRate: DataTypes.INTEGER,
      discount: DataTypes.INTEGER,
      extraRate: DataTypes.INTEGER,
      PerDayKmReturn: DataTypes.INTEGER,
      PerDayKmSingle: DataTypes.INTEGER,
      isDeleted: DataTypes.ENUM('N', 'Y'),
      updatedTime: {
        type: DataTypes.DATE
      },
      createdTime: {
        type: DataTypes.DATE
      }
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
