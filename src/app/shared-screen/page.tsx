'use client';
import { useEffect, useState } from "react";
import { WebsocketProvider } from "y-websocket";
import * as Y from 'yjs';

// 쿠키에서 값을 가져오는 함수
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift()!;
  return null;
}

export default function SharedScreen() {
  const [connectionStatus, setConnectionStatus] = useState('대기 중');
  const [isMentor, setIsMentor] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userType = getCookie('type');
      setIsMentor(userType === 'mentor');
      const wsUrl = process.env.NEXT_PUBLIC_WSS_URL || "ws://127.0.0.1:8080";
      const ydoc = new Y.Doc();
      const yMap = ydoc.getMap('shared-form');

      const timeout = setTimeout(() => {
        const wsProvider = new WebsocketProvider(wsUrl, '', ydoc, {
          WebSocketPolyfill: WebSocket,
        });

        wsProvider.on('status', (event: { status: string }) => {
          console.log(`Connection status: ${event.status}`);
          setConnectionStatus(STATUS_MESSAGES[event.status] || '알 수 없는 상태');
        });

        wsProvider.on('sync', (synced: boolean) => {
          console.log(`Sync status: ${synced ? '동기화 완료' : '동기화 중'}`);
        });

        const form = document.getElementById('shared-form');
        if (form) {
          // 타입을 구체적으로 지정
          const formElements = form.querySelectorAll<
              HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >('input, textarea, select');
          formElements.forEach((element) => {
            if (!element.id) {
              element.id = `form-element-${Math.random().toString(36).substr(2, 9)}`;
            }
            element.addEventListener('input', () => {
              yMap.set(element.id, element.value);
            });
          });
        }

        yMap.observe(() => {
          yMap.forEach((value, key) => {
            const element = document.getElementById(key) as
                | HTMLInputElement
                | HTMLTextAreaElement
                | HTMLSelectElement
                | null;
            if (element && element.value !== value) {
              if (typeof value === "string") {
                element.value = value;
              }
            }
          });
        });

        const awareness = wsProvider.awareness;

        document.addEventListener('mousemove', (event) => {
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;
          const mouseXPercent = (event.clientX / windowWidth) * 100;
          const mouseYPercent = (event.clientY / windowHeight) * 100;
          awareness.setLocalStateField('mouse', { x: mouseXPercent, y: mouseYPercent });
        });

        awareness.on('update', () => {
          const pointers = document.querySelectorAll('.mouse-pointer');
          pointers.forEach((p) => p.remove());

          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          awareness.getStates().forEach((state, clientId) => {
            if (clientId !== awareness.clientID && state.mouse) {
              const pointer = document.createElement('div');
              pointer.className = 'mouse-pointer';
              const posX = (state.mouse.x / 100) * windowWidth;
              const posY = (state.mouse.y / 100) * windowHeight;
              pointer.style.cssText = `
                position: absolute;
                left: ${posX}px;
                top: ${posY}px;
                width: 10px;
                height: 10px;
                background: hsl(${clientId % 360}, 70%, 50%);
                border-radius: 50%;
                pointer-events: none;
              `;
              document.body.appendChild(pointer);
            }
          });
        });

        return () => {
          wsProvider.destroy();
          ydoc.destroy();
        };
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, []);

  return (
      <div className="relative p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">실시간 연결 상태</h1>
        <form id="shared-form" className="space-y-4">
          <input
              type="text"
              id="input1"
              placeholder="Input 1"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              disabled={!isMentor}
          />
          <textarea
              id="textarea1"
              placeholder="Textarea 1"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              disabled={!isMentor}
          ></textarea>
        </form>
        <p className="mt-4 text-lg font-medium text-gray-700">상태: {connectionStatus}</p>
      </div>
  );
}

const STATUS_MESSAGES = {
  connecting: '연결 시도 중... 🟡',
  connected: '연결 성공! 🟢',
  disconnected: '연결 끊김 🔴',
};