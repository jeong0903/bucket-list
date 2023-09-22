// 로컬상에서도 CRUD가 가능
import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, Dimensions, Alert, Pressable, Text } from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native';
import { theme } from './theme';
import Input from './components/Input';
import Task from './components/Task'; /* Task 컴포넌트에 렌더링 됨! */
// import { images } from './Images';
// import IconButton from './components/IconButton';

// 로컬에 데이터관리
import AsyncStorage from '@react-native-async-storage/async-storage';

// 앱 실행시 로딩화면 제어 : 앱 실행전 사전작업이 준비될 때까지 로딩화면을 유지시키는 역할
import * as SplashScreen from 'expo-splash-screen';

// 사전작업이 준비될 때까지 로딩화면 유지
SplashScreen.preventAutoHideAsync();

// 화면 레이아웃을 스타일링하기 위한 컨테이너 컴포넌트
/* padding-top: 50px; - 'SafeAreaView'로 해결 */
const Container = styled.SafeAreaView.attrs(null)`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
  align-items: center;
  justify-content: flex-start;
`;

// 앱 제목 스타일링
const Title = styled.Text`
  font-size: 40px;
  font-weight: 600;
  color: ${({ theme }) => theme.main};
  align-self: center;
  margin: 20px;
  justify-content: center;
`;

// 작업 목록 스타일링
const List = styled.ScrollView`
  flex : 1;
  width: ${({ width }) => width - 40}px;
`;


const App = () => {

  // 앱 준비상태 여부를 판단하는 상태 변수
  const [appIsReady, setAppIsReady] = useState(false);

  // 새로운 작업을 저장하는 상태변수 
  const [newTask, setNewTask] = useState('');

  // 작업 목록을 저장하는 상태변수 (초기값은 빈 객체 리터럴!)
  const [tasks, setTasks] = useState({});

  // 로컬 파일에 저장
  const saveTasks = async tasks => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks)); //js OBJ => JSON포맷의 문자열로 저장
      setTasks(tasks);
    } catch (error) {
      console.log(error.message);
    }
  };

  // 로컬파일에서 작업 목록을 읽어오기
  const loadTask = async () => {
    try {
      const loadedTasks = await AsyncStorage.getItem('tasks');
      setTasks(JSON.parse(loadedTasks || '{}')); // json포맷의 문자자열 => js obj
    } catch (error) {
      console.log(error.message);
    }
  };

  // 앱 실행전 1회 호출
  useEffect(() => {
    async function prepare() {
      try {
        // 앱 실행전 자원 준비 : 로컬파일의 항목 리스트를 읽어와서 task 상태 변수에 저장
        await loadTask();
      } catch (e) {
        console.warn(e);
      } finally {
        // 앱 렌더링을 위해 앱 준비 상태를 true로 설정
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // 앱이 마운트될 때 또는 컨테이너 레이아웃이 재계산될 때마다 수행
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // 앱실행 준비가 되었을 때 로딩 화면을 숨김
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // 앱이 준비상태가 되었을 때만 이하 로직을 수행
  if (!appIsReady) return null;

  // 입력 항목이 수정될때마다 newTask변수에 수정된 내용을 저장
  const h_onChangeText = text => setNewTask(text);

  // 할일 항목 추가
  const h_onSubmitEditing = () => {
    // alert(newTask);
    const key = Date.now().toString();  // 중복되지않는 유일한 임의값
    const newTaskObject = {
      [key]: { id: key, text: newTask, completed: false },
    };
    setNewTask(''); //입력항목 클리어
    // setTasks({ ...tasks, ...newTaskObject }); // 기존 tasks에 새로 입력된 항목 추가
    saveTasks({ ...tasks, ...newTaskObject });
  };

  const { width } = Dimensions.get('window');

  // 할일 항목 항목 삭제 (Test _ 완료된 항목만 삭제 : completed가 true 인것만 추출 -> saveTask에 반영)
  const h_deleteTask = id => {
    const currentTasks = { ...tasks };  // 현재 task 목록의 복제본을 만듦
    // 확인 대화상자 표시
    Alert.alert('', '삭제하시겠습니까?', [
      {
        text: '삭제',
        onPress() {
          console.log('삭제완료');
          delete currentTasks[id];
          setTasks(currentTasks);
          saveTasks(currentTasks); // 상태를 갱신하고 로컬 저장소에 저장
        },
      },
      {
        text: '취소',
        onPress() {
          console.log('취소');
        },
      },
    ]);
  };
  // 할일 항목 완료 | 미완료
  const h_toggleTask = id => {
    const currentTasks = { ...tasks };
    currentTasks[id]['completed'] = !currentTasks[id]['completed']; // 배열아님 주의

    // setTasks(currentTasks);
    saveTasks(currentTasks);
  };

  // 완료된 항목 모두 삭제
  const deleteAllCompletedTasks = () => {
    Alert.alert('', '(완료된 항목)\n전체 삭제하시겠습니까?', [
      {
        text: '삭제',
        onPress: () => {
          console.log('선택항목 삭제완료');
          const currentTasks = { ...tasks };
          for (const id in currentTasks) {
            if (currentTasks[id]['completed']) {
              delete currentTasks[id];
            }
          }
          setTasks(currentTasks);
          saveTasks(currentTasks); // 상태를 갱신하고 로컬 저장소에 저장
        },
      },
      {
        text: '취소',
        onPress: () => {
          console.log('취소');
        },
      },
    ]);
  };


  // 모든 항목 삭제 버튼 컴포넌트
  const AllItemDelBtn = ({ width, onPress, title }) => {
    return (
      <Pressable
        style={{
          backgroundColor: '#BBA89C',
          width: width - 40,
          height: 40,
          margin: 5,
          padding: 5,
          borderRadius: 10,
        }}
        onPress={onPress}
      >
        <Text style={{ textAlign: 'center', padding: 5, color: '#fff' }}>
          {title}
        </Text>
      </Pressable>
    );
  };

  // 할일 항목 수정
  const h_updateTask = task => {
    const currentTasks = { ...tasks };
    currentTasks[task.id] = task;
    // setTasks(currentTasks);
    saveTasks(currentTasks);
  }

  // 할일 항목 등록 취소
  const h_onBlur = () => {
    setNewTask('');
  };


  return (
    <ThemeProvider theme={theme}>
      <Container onLayout={onLayoutRootView}>
        <StatusBar  /* 화면 상단의 시계, 데이터, 배터리 등 */
          barStyle="dark-content"
          backgroundColor={theme.background}
        />
        <Title>Bucket List</Title>
        <Input
          placeholder="➕ 할 일 추가 〰✍🏻 "
          value={newTask}
          onChangeText={h_onChangeText}
          onSubmitEditing={h_onSubmitEditing} // 추가
          onBlur={h_onBlur} // 항목 추가 입력 필드가 포커스 벗어나면 호출
        />
        <List width={width}>
          {Object.values(tasks)
            .reverse()
            .map(task => (
              <Task
                key={task.id}
                // text={task.text}
                // id={task.id}
                task={task}
                deleteTask={h_deleteTask}   // 삭제
                toggleTask={h_toggleTask}   // 완료 | 미완료 -> Task.js <IconButton type={images.uncompleted} />
                updateTask={h_updateTask}   // 수정
              />
            ))}
        </List>

        <AllItemDelBtn
          width={width}
          title="완료된 항목 모두 삭제"
          onPress={deleteAllCompletedTasks}
        />

      </Container>
    </ThemeProvider>
  );
};

export default App;