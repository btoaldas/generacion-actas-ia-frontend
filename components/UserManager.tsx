import React, { useState } from 'react';
import { User, Role, Permission } from '../types';
import { ALL_PERMISSIONS } from '../constants';

// Props para el componente principal UserManager
interface UserManagerProps {
    users: User[];
    roles: Role[];
    onSaveUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onSaveRole: (role: Role) => void;
    onDeleteRole: (roleId: string) => void;
    onBack: () => void;
}

// Modal para crear o editar un usuario
const UserModal: React.FC<{
    user: User | null;
    roles: Role[];
    onClose: () => void;
    onSave: (user: User) => void;
}> = ({ user, roles, onClose, onSave }) => {
    // Estado inicial para un nuevo usuario o para el usuario que se está editando
    const [formData, setFormData] = useState<User>(
        user || { 
            id: `user_${Date.now()}`, 
            name: '', 
            email: '', 
            roleIds: roles.find(r => r.name === 'Visor / Público') ? [roles.find(r => r.name === 'Visor / Público')!.id] : [],
            cedula: '',
            cargo: '',
            institucion: ''
        }
    );

    // Maneja los cambios en los campos del formulario
    const handleChange = (field: keyof Omit<User, 'id' | 'roleIds'>, value: string) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleRoleChange = (roleId: string, isChecked: boolean) => {
        setFormData(prev => {
            const newRoleIds = isChecked 
                ? [...prev.roleIds, roleId]
                : prev.roleIds.filter(id => id !== roleId);
            // Ensure at least one role is selected for simplicity, or handle no-role state if needed
            if (newRoleIds.length === 0) {
                 // You might want to prevent unchecking the last role or handle users without roles
            }
            return { ...prev, roleIds: newRoleIds };
        });
    };

    // Guarda el usuario
    const handleSave = () => {
         if (formData.name.trim() === '' || formData.email.trim() === '' || formData.roleIds.length === 0) {
            alert("Por favor, completa Nombre, Correo y selecciona al menos un Rol.");
            return;
        }
        onSave(formData);
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 max-w-md w-full">
                 <h3 className="text-xl font-bold text-white mb-4">{user ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                 <div className="space-y-4">
                     <input type="text" placeholder="Nombre Completo" value={formData.name} onChange={e => handleChange('name', e.target.value)} className="w-full bg-gray-700 rounded p-2 text-white" />
                     <input type="email" placeholder="Correo Electrónico" value={formData.email} onChange={e => handleChange('email', e.target.value)} className="w-full bg-gray-700 rounded p-2 text-white" />
                     <input type="text" placeholder="Cédula (opcional)" value={formData.cedula || ''} onChange={e => handleChange('cedula', e.target.value)} className="w-full bg-gray-700 rounded p-2 text-white" />
                     <input type="text" placeholder="Cargo (opcional)" value={formData.cargo || ''} onChange={e => handleChange('cargo', e.target.value)} className="w-full bg-gray-700 rounded p-2 text-white" />
                     <input type="text" placeholder="Institución (opcional)" value={formData.institucion || ''} onChange={e => handleChange('institucion', e.target.value)} className="w-full bg-gray-700 rounded p-2 text-white" />
                     
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Roles</label>
                        <div className="mt-2 space-y-2 p-3 bg-gray-900/50 rounded-md max-h-40 overflow-y-auto border border-gray-600">
                            {roles.map(role => (
                                <label key={role.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700/50">
                                    <input
                                        type="checkbox"
                                        checked={formData.roleIds.includes(role.id)}
                                        onChange={e => handleRoleChange(role.id, e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="text-sm text-gray-300">{role.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                 </div>
                 <div className="flex justify-end gap-3 pt-4 mt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm rounded-md bg-purple-600 hover:bg-purple-700">Guardar Usuario</button>
                </div>
            </div>
        </div>
    );
}

// Modal para crear o editar un rol
const RoleModal: React.FC<{
    role: Role | null;
    onClose: () => void;
    onSave: (role: Role) => void;
}> = ({ role, onClose, onSave }) => {
    const [formData, setFormData] = useState<Role>(
        role || { id: `role_${Date.now()}`, name: '', permissions: [] }
    );

    const handlePermissionChange = (permission: Permission, isChecked: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissions: isChecked
                ? [...prev.permissions, permission]
                : prev.permissions.filter(p => p !== permission),
        }));
    };

    const handleSave = () => {
        if (formData.name.trim() === '') {
            alert("Por favor, introduce un nombre para el rol.");
            return;
        }
        onSave(formData);
        onClose();
    };

     return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700 max-w-lg w-full max-h-[90vh] flex flex-col">
                <h3 className="text-xl font-bold text-white mb-4">{role ? 'Editar Rol' : 'Nuevo Rol'}</h3>
                <div className="overflow-y-auto pr-2 space-y-4 flex-grow">
                    <input type="text" placeholder="Nombre del Rol" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-700 rounded p-2 text-white" />
                    <h4 className="text-lg font-semibold text-gray-300 pt-2">Permisos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {ALL_PERMISSIONS.map(p => (
                            <label key={p.id} className="flex items-center space-x-3 bg-gray-700/50 p-3 rounded-md">
                                <input
                                    type="checkbox"
                                    checked={formData.permissions.includes(p.id)}
                                    onChange={e => handlePermissionChange(p.id, e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-500 bg-gray-800 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="text-sm text-gray-300">{p.description}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-4">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-700">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm rounded-md bg-purple-600 hover:bg-purple-700">Guardar Rol</button>
                </div>
            </div>
        </div>
    );
};


const UserManager: React.FC<UserManagerProps> = ({ users, roles, onSaveUser, onDeleteUser, onSaveRole, onDeleteRole, onBack }) => {
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const [isRoleModalOpen, setRoleModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setUserModalOpen(true);
    };

    const handleNewUser = () => {
        setEditingUser(null);
        setUserModalOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setRoleModalOpen(true);
    };

    const handleNewRole = () => {
        setEditingRole(null);
        setRoleModalOpen(true);
    };

    return (
        <div className="animate-fade-in">
            {isUserModalOpen && <UserModal user={editingUser} roles={roles} onClose={() => setUserModalOpen(false)} onSave={onSaveUser} />}
            {isRoleModalOpen && <RoleModal role={editingRole} onClose={() => setRoleModalOpen(false)} onSave={onSaveRole} />}

            <h2 className="text-3xl font-bold text-gray-100 flex items-center gap-3 mb-4">
                <button onClick={onBack} className="text-gray-400 hover:text-white"><i className="fas fa-arrow-left"></i></button>
                Gestión de Usuarios y Roles
            </h2>
            <p className="text-gray-400 mb-6 max-w-3xl">
                Añade, edita y elimina usuarios de la plataforma, y gestiona los roles para controlar el acceso a las funcionalidades.
            </p>

            <div className="border-b border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('users')} className={`${activeTab === 'users' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Usuarios ({users.length})</button>
                    <button onClick={() => setActiveTab('roles')} className={`${activeTab === 'roles' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Roles ({roles.length})</button>
                </nav>
            </div>

            {activeTab === 'users' && (
                <div>
                    <div className="flex justify-end mb-4">
                         <button onClick={handleNewUser} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                            <i className="fas fa-plus"></i> Nuevo Usuario
                        </button>
                    </div>
                     <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Correo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Cargo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Roles</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 text-sm text-white">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-300">{user.cargo || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-300">{user.roleIds.map(roleId => roles.find(r => r.id === roleId)?.name).filter(Boolean).join(', ')}</td>
                                        <td className="px-6 py-4 text-right text-sm space-x-2">
                                            <button onClick={() => handleEditUser(user)} className="text-purple-400 hover:text-purple-300">Editar</button>
                                            <button onClick={() => onDeleteUser(user.id)} className="text-red-500 hover:text-red-400">Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'roles' && (
                 <div>
                      <div className="flex justify-end mb-4">
                         <button onClick={handleNewRole} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                            <i className="fas fa-plus"></i> Nuevo Rol
                        </button>
                    </div>
                    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Nombre del Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Usuarios Asignados</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 divide-y divide-gray-700">
                                {roles.map((role) => (
                                    <tr key={role.id}>
                                        <td className="px-6 py-4 text-sm font-medium text-white">{role.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-300">{users.filter(u => u.roleIds.includes(role.id)).length}</td>
                                        <td className="px-6 py-4 text-right text-sm space-x-2">
                                            <button onClick={() => handleEditRole(role)} className="text-purple-400 hover:text-purple-300">Editar</button>
                                            <button onClick={() => onDeleteRole(role.id)} className="text-red-500 hover:text-red-400">Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;