'use server';

import connectDB from '@/lib/mongodb';
import { Employee, User } from '@/models';
import { revalidatePath } from 'next/cache';
import { escapeRegex } from '@/lib/utils';

export async function getEmployees(filters?: {
  search?: string;
  department?: string;
}) {
  await connectDB();

  const query: any = { isActive: true };

  if (filters?.search) {
    const safeSearch = escapeRegex(filters.search);
    query.$or = [
      { position: { $regex: safeSearch, $options: 'i' } },
      { department: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  if (filters?.department) {
    query.department = filters.department;
  }

  const employees = await Employee.find(query)
    .populate('userId', 'name email phone avatar')
    .populate('branchId', 'name')
    .sort({ createdAt: -1 });

  return JSON.parse(JSON.stringify(employees));
}

export async function getEmployeeById(id: string) {
  await connectDB();

  const employee = await Employee.findById(id)
    .populate('userId', 'name email phone avatar')
    .populate('branchId', 'name');

  return JSON.parse(JSON.stringify(employee));
}

export async function createEmployee(data: any) {
  await connectDB();

  // First create the user
  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role || 'cashier',
    phone: data.phone,
  });

  // Then create the employee
  const employee = await Employee.create({
    userId: user._id,
    employeeId: `EMP-${Date.now()}`,
    position: data.position,
    department: data.department,
    salary: data.salary,
    hireDate: data.hireDate || new Date(),
    branchId: data.branchId,
  });

  revalidatePath('/dashboard/employees');
  return JSON.parse(JSON.stringify({ employee, user }));
}

export async function updateEmployee(id: string, data: any) {
  await connectDB();

  const employee = await Employee.findByIdAndUpdate(
    id,
    { ...data },
    { new: true, runValidators: true }
  );

  revalidatePath('/dashboard/employees');
  return JSON.parse(JSON.stringify(employee));
}

export async function deleteEmployee(id: string) {
  await connectDB();

  const employee = await Employee.findById(id);
  if (employee) {
    await User.findByIdAndUpdate(employee.userId, { isActive: false });
    await Employee.findByIdAndUpdate(id, { isActive: false });
  }

  revalidatePath('/dashboard/employees');
  return { success: true };
}

export async function updateEmployeePerformance(id: string, performance: any) {
  await connectDB();

  const employee = await Employee.findByIdAndUpdate(
    id,
    { $set: { performance } },
    { new: true, runValidators: true }
  );

  revalidatePath('/dashboard/employees');
  return JSON.parse(JSON.stringify(employee));
}

export async function updateEmployeeAttendance(id: string, attendance: any) {
  await connectDB();

  const employee = await Employee.findByIdAndUpdate(
    id,
    { $set: { attendance } },
    { new: true, runValidators: true }
  );

  revalidatePath('/dashboard/employees');
  return JSON.parse(JSON.stringify(employee));
}
