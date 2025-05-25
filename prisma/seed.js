import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a parent group
    const parentGroup = await prisma.parentGroup.create({
      data: {
        name: 'Roofing Experts Group',
        code: 'REG',
      },
    });

    console.log('Created parent group:', parentGroup);

    // Create companies
    const companies = await Promise.all([
      prisma.company.create({
        data: {
          name: 'ABC Roofing',
          code: 'ABC',
          address: '123 Main St, Anytown, USA',
          phone: '(555) 123-4567',
          email: 'info@abcroofing.example',
          parentGroupId: parentGroup.id,
        },
      }),
      prisma.company.create({
        data: {
          name: 'XYZ Contractors',
          code: 'XYZ',
          address: '456 Oak Ave, Somewhere, USA',
          phone: '(555) 987-6543',
          email: 'info@xyzcontractors.example',
          parentGroupId: parentGroup.id,
        },
      }),
    ]);

    console.log('Created companies:', companies);

    // Create departments for each company
    for (const company of companies) {
      await prisma.department.createMany({
        data: [
          {
            name: 'Residential',
            code: 'RES',
            companyId: company.id,
          },
          {
            name: 'Commercial',
            code: 'COM',
            companyId: company.id,
          },
        ],
      });
    }

    console.log('Created departments for each company');

    // Create inspectors for each company
    const inspectors = [];
    for (const company of companies) {
      const companyInspectors = await Promise.all([
        prisma.inspector.create({
          data: {
            name: `John Doe (${company.code})`,
            code: `INS-001-${company.code}`,
            email: `john.doe@${company.code.toLowerCase()}.example`,
            phone: '(555) 111-2222',
            companyId: company.id,
          },
        }),
        prisma.inspector.create({
          data: {
            name: `Jane Smith (${company.code})`,
            code: `INS-002-${company.code}`,
            email: `jane.smith@${company.code.toLowerCase()}.example`,
            phone: '(555) 333-4444',
            companyId: company.id,
          },
        }),
      ]);
      inspectors.push(...companyInspectors);
    }

    console.log('Created inspectors for each company');

    // Create customers
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          name: 'Residential Customer 1',
          address: '789 Pine St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          phone: '(555) 567-8901',
          email: 'customer1@example.com',
        },
      }),
      prisma.customer.create({
        data: {
          name: 'Commercial Customer 2',
          address: '101 Business Blvd',
          city: 'Commerce City',
          state: 'NY',
          zipCode: '67890',
          phone: '(555) 234-5678',
          email: 'customer2@example.com',
        },
      }),
    ]);

    console.log('Created customers');

    // For each company, create sample reports
    for (const company of companies) {
      // Get departments for this company
      const departments = await prisma.department.findMany({
        where: { companyId: company.id },
      });
      
      // Get inspectors for this company
      const companyInspectors = await prisma.inspector.findMany({
        where: { companyId: company.id },
      });
      
      // Create a report for each department
      for (const department of departments) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const inspector = companyInspectors[Math.floor(Math.random() * companyInspectors.length)];
        
        await prisma.report.create({
          data: {
            reportCode: `${company.code}-${department.code}-${Date.now().toString().slice(-6)}`,
            inspectionDate: new Date(),
            notes: `Sample inspection report for ${customer.name} by ${inspector.name}`,
            status: 'SUBMITTED',
            inspectorId: inspector.id,
            companyId: company.id,
            departmentId: department.id,
            customerId: customer.id,
          },
        });
      }
    }

    console.log('Created sample reports for each company and department');

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();