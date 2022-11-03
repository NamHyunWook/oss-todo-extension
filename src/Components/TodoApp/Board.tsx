import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { dragBoard, IToDo, toDoState } from "../../atoms";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import { Draggable, Droppable } from "react-beautiful-dnd";
import Card from "./Card";

const BoardWrapper = styled.div<{ isDragging: boolean }>`
  min-width: 300px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  margin: 5px;
  padding: 10px 0;
  border-radius: 5px;

  background-color: ${(props) =>
    props.isDragging ? props.theme.cardColor : props.theme.boardColor};
  box-shadow: ${(props) =>
    props.isDragging ? "0px 2px 5px rgba(0, 0, 0, 0.5)" : "none"};
`;
const Title = styled.h2`
  text-align: center;
  font-weight: 600;
  margin-bottom: 10px;
  font-size: 18px;
`;
const InputForm = styled.form`
  width: 100%;
  & > input {
    width: 100%;
  }
`;

interface IAreaProps {
  isDraggingOver: boolean;
  draggingFromThisWith: boolean;
}
const CardDropArea = styled.div<IAreaProps>`
  flex-grow: 1;
  padding: 20px;

  background-color: ${(props) =>
    props.isDraggingOver
      ? props.theme.dropBoardColor
      : props.draggingFromThisWith
      ? props.theme.startBoardColor
      : "transparent"};
  transition: background-color 0.3s ease-out;
`;

interface IBoardProps {
  boardId: string;
  boardIdx: number;
  toDos: IToDo[];
}
interface IForm {
  toDo: string;
}
function Board({ boardId, boardIdx, toDos }: IBoardProps) {
  const setToDos = useSetRecoilState(toDoState);
  const isDragBoard = useRecoilValue(dragBoard);
  const { register, setValue, handleSubmit } = useForm<IForm>();
  const onValid = ({ toDo }: IForm) => {
    const newToDo: IToDo = {
      id: Date.now(),
      text: toDo,
      expDate: null,
    };
    setToDos((prev) => ({
      ...prev,
      [boardId]: [newToDo, ...prev[boardId]],
    }));
    setValue("toDo", "");
  };

  return (
    <Draggable draggableId={boardId} index={boardIdx}>
      {(boardProvided, boardInSnapshot) => (
        <BoardWrapper
          isDragging={boardInSnapshot.isDragging}
          ref={boardProvided.innerRef}
          {...boardProvided.draggableProps}
          {...boardProvided.dragHandleProps}
        >
          <Title>{boardId}</Title>
          <InputForm onSubmit={handleSubmit(onValid)}>
            <input
              {...register("toDo", { required: true })}
              type="text"
              placeholder={`Add task on ${boardId}`}
            />
          </InputForm>
          <Droppable droppableId={boardId} isDropDisabled={isDragBoard}>
            {(cardProvider, cardSnapshot) => (
              <CardDropArea
                isDraggingOver={cardSnapshot.isDraggingOver}
                draggingFromThisWith={Boolean(
                  cardSnapshot.draggingFromThisWith
                )}
                ref={cardProvider.innerRef}
                {...cardProvider.droppableProps}
              >
                {toDos.map((todo, cardIdx) => (
                  <Card
                    key={todo.id}
                    cardIdx={cardIdx}
                    cardId={todo.id}
                    cardText={todo.text}
                  />
                ))}
                {cardProvider.placeholder}
              </CardDropArea>
            )}
          </Droppable>
        </BoardWrapper>
      )}
    </Draggable>
  );
}

export default React.memo(Board);
