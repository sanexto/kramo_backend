import { QueryInterface, Transaction, } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface, Sequelize: any): Promise<void> => {

    return queryInterface.sequelize.transaction(async (t: Transaction): Promise<void> => {

      const now: Date = new Date();

      try {

        await queryInterface.bulkInsert('Users',
          [
            {
              id: 1,
              username: 'sanexto',
              password: '$2b$10$L5itBz7cENWYqS6ilXu7iuXBVxrsKj/uVHYuDi4scxQ3lODOhhTPm',
              profile: 'admin',
              createdAt: now,
              updatedAt: now,
            },
          ],
          {
            transaction: t,
          },
        );

        await queryInterface.bulkInsert('Admins',
          [
            {
              id: 1,
              name: 'Ricardo',
              surname: 'Perez',
              email: 'sanexto@gmail.com',
              createdAt: now,
              updatedAt: now,
              userId: 1,
            },
          ],
          {
            transaction: t, 
          },
        );
        
      } catch (e) {

        throw e;
        
      }

    });

  },
  down: async (queryInterface: QueryInterface, Sequelize: any): Promise<void> => {

    return queryInterface.sequelize.transaction(async (t: Transaction): Promise<void> => {

      try {

        await queryInterface.bulkDelete('Admins',
          {
            id: 1,
          },
          {
            transaction: t,
          },
        );

        await queryInterface.bulkDelete('Users',
          {
            id: 1,
          },
          {
            transaction: t,
          },
        );
        
      } catch (e) {

        throw e;
        
      }

    });

  },
};
