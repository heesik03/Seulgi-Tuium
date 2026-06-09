import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getDashboardStats, getUserList, updateUserRole, forceDeleteUser } from './api/adminApi';
import type { AdminDashboardRes, AdminUserListRes, PageResponse } from './types/adminTypes';
import { ShieldCheck, ArrowLeft, Users, Database, Search, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const TABLE_HEADERS = [
  { id: 'id', label: 'ID' },
  { id: 'name', label: '이름' },
  { id: 'email', label: '이메일' },
  { id: 'createdDate', label: '가입일자' },
  { id: 'isLocked', label: '잠금여부' },
  { id: 'role', label: '권한 관리' },
  { id: 'action', label: '액션', alignCenter: true },
];

export default function AdminPage() {
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminDashboardRes | null>(null);
  const [usersPage, setUsersPage] = useState<PageResponse<AdminUserListRes> | null>(null);
  
  const [searchName, setSearchName] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!isAdmin) {
      alert("관리자 권한이 필요합니다.");
      navigate("/", { replace: true });
    }
  }, [isAdmin, navigate]);

  const loadDashboard = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("대시보드 통계 조회 실패:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getUserList({ name: searchName || undefined, page, size: 10 });
      setUsersPage(data);
    } catch (error) {
      console.error("사용자 목록 조회 실패:", error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboard();
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadUsers();
  };

  const handleRoleChange = async (userId: number, newRole: "ROLE_ADMIN" | "ROLE_USER") => {
    if (!window.confirm("정말 권한을 변경하시겠습니까?")) return;
    try {
      await updateUserRole(userId, newRole);
      alert("권한이 변경되었습니다.");
      loadUsers();
    } catch (error) {
      alert("권한 변경에 실패했습니다.");
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!window.confirm(`[${userName}] 회원을 강제로 탈퇴시키겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.`)) return;
    try {
      await forceDeleteUser(userId);
      alert("탈퇴 처리되었습니다.");
      loadDashboard();
      loadUsers();
    } catch (error) {
      alert("강제 탈퇴 처리에 실패했습니다.");
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="flex flex-col min-h-screen px-4 py-8 max-w-6xl mx-auto w-full">
      <header className="mb-8 flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <button 
          onClick={() => navigate('/mypage')}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-500 dark:text-slate-400"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            관리자 대시보드
          </h1>
        </div>
      </header>

      {/* 대시보드 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 flex items-center gap-6">
          <div className="h-14 w-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">총 가입 회원</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {stats?.totalUserCount?.toLocaleString() || 0}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 flex items-center gap-6">
          <div className="h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">누적 시스템 단어</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
              {stats?.totalWordCount?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      </div>
      
      {/* 사용자 관리 테이블 섹션 */}
      <main className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">회원 관리</h2>
          
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="이름으로 검색..." 
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-hidden focus:border-blue-500 transition"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
                {TABLE_HEADERS.map((header) => (
                  <th 
                    key={header.id} 
                    className={`px-6 py-4 border-b border-slate-200 dark:border-slate-700 ${header.alignCenter ? 'text-center' : ''}`}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {usersPage?.content.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{user.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{user.email}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {user.isLocked ? (
                      <span className="text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-md text-xs font-bold">잠금됨</span>
                    ) : (
                      <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md text-xs font-bold">정상</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as "ROLE_ADMIN" | "ROLE_USER")}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 cursor-pointer outline-hidden"
                    >
                      <option value="ROLE_USER">일반 (USER)</option>
                      <option value="ROLE_ADMIN">관리자 (ADMIN)</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="inline-flex items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                      title="강제 탈퇴"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {usersPage?.content.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                    검색된 사용자가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {usersPage && usersPage.totalPages > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              총 {usersPage.totalElements}명 중 {page * usersPage.pageSize + 1} ~ {Math.min((page + 1) * usersPage.pageSize, usersPage.totalElements)}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={usersPage.currentPage === 0}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">
                {usersPage.currentPage + 1} / {usersPage.totalPages}
              </span>
              <button 
                onClick={() => setPage(p => Math.min(usersPage.totalPages - 1, p + 1))}
                disabled={!usersPage.hasNext}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
