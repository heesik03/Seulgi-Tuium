import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getMyPageStats, updateUserName, updatePassword, deleteAccount } from './api/myPageApi';
import type { MyPageRes } from './types/myPageTypes';
import { User, ShieldAlert, ArrowRight, BookOpen, Star, BrainCircuit, Edit2, Lock, Trash2, X } from 'lucide-react';

export default function MyPage() {
  const { userName, role, isAdmin, setAccessToken, logout } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<MyPageRes | null>(null);

  // 모달 상태 관리
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const [isPwModalOpen, setIsPwModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getMyPageStats();
        setStats(data);
      } catch (error) {
        console.error("마이페이지 정보 조회 실패:", error);
      }
    };
    fetchStats();
  }, []);

  const handleNameChange = async () => {
    if (!newName.trim() || newName.length > 30) {
      alert("이름은 1~30자 사이로 입력해주세요.");
      return;
    }
    try {
      const { accessToken } = await updateUserName(newName.trim());
      setAccessToken(accessToken);
      alert("이름이 변경되었습니다.");
      setIsNameModalOpen(false);
      setNewName("");
      // 통계 다시 불러오기
      const data = await getMyPageStats();
      setStats(data);
    } catch (error) {
      alert("이름 변경에 실패했습니다. 이미 존재하는 이름일 수 있습니다.");
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword.trim()) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }
    try {
      await updatePassword(newPassword);
      alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
      logout();
      navigate("/login");
    } catch (error) {
      alert("비밀번호 변경에 실패했습니다.");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "회원 탈퇴") {
      alert("'회원 탈퇴'를 정확히 입력해주세요.");
      return;
    }
    try {
      await deleteAccount();
      alert("회원 탈퇴 처리가 완료되었습니다.");
      logout();
      navigate("/");
    } catch (error) {
      alert("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[80vh] px-4 py-8">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-6 md:p-10 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 dark:border-slate-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-inner">
              <User className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {stats?.name || userName || '사용자'}
                <button onClick={() => setIsNameModalOpen(true)} className="text-slate-400 hover:text-blue-500 transition-colors p-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer" aria-label="이름 수정">
                  <Edit2 className="h-4 w-4" />
                </button>
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                {stats?.email || ''}
              </p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {role === 'ROLE_ADMIN' ? '관리자 계정' : '일반 계정'}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 min-w-35">
            <button
              onClick={() => setIsPwModalOpen(true)}
              className="flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              비밀번호 변경
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              회원 탈퇴
            </button>
          </div>
        </div>

        {/* 통계 섹션 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <BookOpen className="h-6 w-6 text-blue-500 mb-2" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.wordBookCount || 0}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">단어장</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <Star className="h-6 w-6 text-amber-500 mb-2" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.favoriteWordCount || 0}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">즐겨찾기 단어</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <BrainCircuit className="h-6 w-6 text-purple-500 mb-2" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.quizCount || 0}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">생성한 퀴즈</span>
          </div>
        </div>

        {isAdmin && (
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 tracking-wide">
              <ShieldAlert className="h-4 w-4 text-emerald-500" />
              관리자 전용 기능
            </h2>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors group cursor-pointer shadow-sm"
            >
              <span className="font-semibold text-sm">관리자 페이지로 이동</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* 이름 변경 모달 */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">이름 변경</h3>
              <button onClick={() => setIsNameModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <input 
              type="text" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              placeholder="새로운 이름을 입력하세요"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white mb-4 outline-hidden focus:border-blue-500 dark:focus:border-blue-500 transition"
              maxLength={30}
            />
            <button onClick={handleNameChange} className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition shadow-md cursor-pointer">
              변경하기
            </button>
          </div>
        </div>
      )}

      {/* 비밀번호 변경 모달 */}
      {isPwModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">비밀번호 변경</h3>
              <button onClick={() => setIsPwModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-4 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-200 dark:border-amber-900/50">
              비밀번호를 변경하면 즉시 로그아웃되며 다시 로그인해야 합니다.
            </p>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              placeholder="새로운 비밀번호"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white mb-4 outline-hidden focus:border-blue-500 dark:focus:border-blue-500 transition"
            />
            <button onClick={handlePasswordChange} className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition shadow-md cursor-pointer">
              변경하기
            </button>
          </div>
        </div>
      )}

      {/* 회원 탈퇴 모달 (AWS 스타일) */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-red-200 dark:border-red-900/50 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                회원 탈퇴
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              탈퇴 시 사용자의 모든 데이터(단어장, 퀴즈, 즐겨찾기 등)가 <strong>영구적으로 삭제</strong>되며 복구할 수 없습니다.
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg mb-4 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                정말로 탈퇴하시려면 아래 입력창에 <strong className="text-red-500">회원 탈퇴</strong> 라고 입력해주세요.
              </p>
              <input 
                type="text" 
                value={deleteConfirmText} 
                onChange={(e) => setDeleteConfirmText(e.target.value)} 
                placeholder="회원 탈퇴"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-hidden focus:border-red-500 dark:focus:border-red-500 transition"
              />
            </div>
            <button 
              onClick={handleDeleteAccount} 
              disabled={deleteConfirmText !== "회원 탈퇴"}
              className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold transition shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              영구 탈퇴하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
