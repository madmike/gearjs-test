'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Messages', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.STRING
            },
            type: {
                type: Sequelize.INTEGER
            },
            success: {
                type: Sequelize.BOOLEAN
            },
            text: {
                type: Sequelize.STRING
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        }).then(() => queryInterface.addIndex('Messages', ['type', 'success']));
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Messages');
    }
};