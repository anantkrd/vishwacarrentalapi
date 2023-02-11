'use strict';
const {Sequelize,DataTypes, Model}=require('sequelize');
const sequelize=require('../config/database');
/** @type {import('sequelize-cli').Migration} */
//const queryInterface = sequelize.queryInterface;
const path = require('path');

module.exports = {
  
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('vcr_cabs', 'note4', {
      type: DataTypes.STRING
    });
    /*
    await queryInterface.addColumn('vcr_cabs', 'PerDayKmReturn', {
      type: DataTypes.INTEGER
    }),
    await queryInterface.addColumn('vcr_cabs', 'PerDayKmSingle', {
      type: DataTypes.INTEGER
    }),
    await queryInterface.addColumn('vcr_cabs', 'note', {
      type: DataTypes.STRING
    }),
    })
    await queryInterface.addColumn('vcr_cabs', 'isDeleted', {
      type: DataTypes.ENUM('N', 'Y'),
    });*/
    
    /*await queryInterface.createTable('vcr_cabs1', {
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
    });*/
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('vcr_cabs', 'note', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
