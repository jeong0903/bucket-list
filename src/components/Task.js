import React, { useState, useRef } from "react";
import styled from 'styled-components/native';
import PropTypes, { node } from 'prop-types';
import IconButton from './IconButton';
import { images } from '../Images';
import Input from "./Input"; // 할 일 입력하는 컴포넌트

const Container = styled.View`
    flex-direction: row;
    align-items: center;
    background-color: ${({ theme }) => theme.itemBackground};
    border-radius: 10px;
    padding: 5px;
    margin: 3px 0;
    `;

const Contents = styled.Text`
    flex: 1;
    font-size: 18px;
    color: ${({ theme, completed }) => completed ? theme.done : theme.text};
    text-decoration-line: ${({ completed }) =>
        completed ? 'none' : 'none'};
`;

const Task = ({ task, deleteTask, toggleTask, updateTask }) => {
    const [isEditing, setIsEditing] = useState(false); // 수정상태 판단: 초기값은 false
    const [text, setText] = useState(task.text);

    // inputRef 추가
    const inputRef = useRef(null);

    // 수정 버튼 클릭 시 isEditing을 true로 설정하고 포커스를 설정하는 함수
    const handleUpdateButtonPress = () => {
        setIsEditing(true);
        // 수정 버튼을 눌렀을 때 포커스를 `Input` 컴포넌트로 설정
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // 수정 버튼 클릭 시 isEditing 상태변수를 true로 변환
    const h_update = () => setIsEditing(true);

    const h_onSubmitEditing = () => {
        if (!isEditing) return;
        const editedTask = { ...task, text };

        // 수정 완료 시 isEditing 상태변수를 false로 변환
        setIsEditing(false);
        updateTask(editedTask);
    };

    const h_onBlur = () => {
        if (isEditing) {
            setIsEditing(false);    // 조회 모드
            setText(task.text);    // 수정내용 이전 등록 항목으로 초기화
        }
    }

    
    return isEditing ? (
        <Input
            value={text}
            // onChangeText={(updatedText) => { 
            //     setText(updatedText); 
            // }}
            onChangeText={setText}
            onSubmitEditing={h_onSubmitEditing}
            onBlur={h_onBlur}
            autoFocus={true} // 수정 버튼을 눌렀을 때 포커스가 잡히도록 설정
            ref={inputRef}
        />
        //수정상태일 때 input이 렌더링
    ) : (
        <Container>
            <IconButton
                type={task.completed ? images.completed : images.uncompleted}
                id={task.id}
                onPressOut={toggleTask}
            />
            <Contents completed={task.completed}>{task.text}</Contents>
            {task.completed || (
                <IconButton type={images.update} onPressOut={h_update} />
            )}
            <IconButton
                type={images.delete}
                id={task.id}
                onPressOut={deleteTask} />
        </Container>
    );
};

Task.proptypes = {
    task: PropTypes.object.isRequired,
    deleteTask: PropTypes.func.isRequired,
    toggleTask: PropTypes.func.isRequired,
    updateTask: PropTypes.func.isRequired,
};

export default Task;