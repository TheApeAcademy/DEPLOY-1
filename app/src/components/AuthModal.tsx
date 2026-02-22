import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { User } from '@/types';
import { signIn, signUp } from '@/services/auth';
import { logActivity } from '@/services/database';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuth: (user: User, isSignup: boolean) => void;
}

export function AuthModal({ isOpen, onClose, onAuth }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => { setName(''); setEmail(''); setPassword(''); setShowPassword(false); };
  const handleClose = () => { resetForm(); onClose(); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { user, error } = await signIn(email, password);
    if (error || !user) { toast.error(error || 'Login failed'); setIsLoading(false); return; }
    await logActivity({ type: 'user_login', userId: user.id, userName: user.name, userEmail: user.email, description: `${user.name} logged in` });
    toast.success(user.role === 'admin' ? 'Welcome back, Admin!' : 'Welcome back!');
    onAuth(user, false);
    handleClose();
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    const { user, error } = await signUp(name, email, password);
    if (error || !user) { toast.error(error || 'Signup failed'); setIsLoading(false); return; }
    await logActivity({ type: 'user_registered', userId: user.id, userName: user.name, userEmail: user.email, description: `New user registered: ${name}` });
    toast.success('Account created! Welcome to ApeAcademy 🦍');
    onAuth(user, true);
    handleClose();
    setIsLoading(false);
  };

  const Spinner = () => (
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', duration: 0.5 }}
              className="w-full max-w-md">
              <div className="relative backdrop-blur-2xl bg-white/95 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🦍</div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">ApeAcademy</h2>
                      <p className="text-xs text-gray-500">Premium Assignment Platform</p>
                    </div>
                  </div>
                  <Button onClick={handleClose} variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="login">Log In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 rounded-xl bg-gray-50 pl-10" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="h-12 rounded-xl bg-gray-50 pl-10 pr-10" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-white font-semibold" style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                          {isLoading ? <Spinner /> : 'Log In'}
                        </Button>
                      </form>
                    </TabsContent>
                    <TabsContent value="signup">
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required className="h-12 rounded-xl bg-gray-50 pl-10" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-12 rounded-xl bg-gray-50 pl-10" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="h-12 rounded-xl bg-gray-50 pl-10 pr-10" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl text-white font-semibold" style={{ background: 'linear-gradient(135deg,#047857,#10b981)' }}>
                          {isLoading ? <Spinner /> : 'Create Account'}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </div>
                <div className="p-4 bg-gray-50 text-center text-xs text-gray-400">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
