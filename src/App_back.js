// 메모리상에서만 CRUD
import React, { useState } from 'react';
import { StatusBar, Dimensions } from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native';
import { theme } from './theme';
import Input from './components/Input';

import Task from './components/Task';
/* Task 컴포넌트에 렌더링 됨! */
// import { images } from './Images';
// import IconButton from './components/IconButton';

/* padding-top: 50px; - 'SafeAreaView'로 해결 */
const Container = styled.SafeAreaView.attrs(null)`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
  align-items: center;
  justify-content: flex-start;
`;

const Title = styled.Text`
  font-size: 40px;
  font-weight: 600;
  color: ${({ theme }) => theme.main};
  align-self: flex-start;
  margin: 20px;
`;

const List = styled.ScrollView`
  flex : 1;
  width: ${({ width }) => width - 40}px;
`;
const App = () => {
  // const tmp = {
  //   '1': { id: '1', text: 'a', completed: false },
  //   '2': { id: '2', text: 'b', completed: true },
  //   '3': { id: '3', text: 'c', completed: false },
  // };

  // 초기값은 빈 객체 리터럴!
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState({});

  // 입력 항목이 수정될때마다 newTask변수에 수정된 내용을 저장
  const h_onChangeText = text => setNewTask(text);
  const h_onSubmitEditing = () => {
    // alert(newTask);
    const key = Date.now().toString();  // 중복되지않는 유일한 임의값
    const newTaskObject = {
      [key]: { id: key, text: newTask, completed: false },
    }
    setNewTask(''); //입력항목 클리어
    setTasks({ ...tasks, ...newTaskObject });
  };

  const { width } = Dimensions.get('window');

  // 할일 항목 항목 삭제
  const h_deleteTask = id => {
    alert('🙅🏻‍♂️삭제되었습니다🙅🏻‍♀️')
    const currentTasks = { ...tasks };  // 현재 task 목록의 복제본을 만듦
    delete currentTasks[id];           // current의 [id]속성 삭제
    setTasks(currentTasks);
  };
  // 할일 항목 완료 | 미완료
  const h_toggleTask = id => {
    const currentTasks = { ...tasks };
    currentTasks[id]['completed'] = !currentTasks[id]['completed']; // 배열아님 주의

    setTasks(currentTasks);
  };

  // 할일 항목 수정
  const h_updateTask = task => {
    const currentTasks = { ...tasks };
    currentTasks[task.id] = task;
    setTasks(currentTasks);
  }

  // 할일 항목 등록 취소
  const h_onBlur = () => {
    setNewTask('');
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <StatusBar  /* 화면 상단의 시계, 데이터, 배터리 등 */
          barStyle="dark-content"
          backgroundColor={theme.background}
        />
        <Title>TODO List</Title>
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
      </Container>
    </ThemeProvider>
  );
};

export default App;