import React, { Component } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import Swipeout from 'react-native-swipeout';

import realm, {
    deleteTodoList, queryAllTodoLists,
    filterTodoLists, insertTodos2TodoList, getTodosFromTodoListId
} from '../databases/allSchemas';
import HeaderComponent from './HeaderComponent';
import PopupDialogComponent from './PopupDialogComponent';
import { SORT_ASCENDING, SORT_DESCENDING } from './sortStates';

let FlatListItem = props => {
    const { itemIndex, id, name, creationDate, popupDialogComponent, onPressItem } = props;

    showEditModal = () => {
        popupDialogComponent.showDialogComponentForUpdate({
            id, name
        });
    }

    showDeleteConfirmation = () => {
        Alert.alert(
            'Delete',
            'Delete todo',
            [
                {
                    text: 'No', onPress: () => { },
                    style: 'cancel'
                },
                {
                    text: 'Yes', onPress: () => {
                        deleteTodoList(id).then().catch(error => {
                            alert(`Failed to delete todo with id = ${id}, error=${error}`);
                        });
                    }
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <Swipeout right={[
            {
                text: 'Edit',
                backgroundColor: 'green',
                onPress: showEditModal
            },
            {
                text: 'Delete',
                backgroundColor: 'red',
                onPress: showDeleteConfirmation
            }
        ]} autoClose={true}>
            <TouchableOpacity onPress={onPressItem}>
                <View style={{ backgroundColor: itemIndex % 2 == 0 ? 'darkgray' : 'gray' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, margin: 10, color:'white' }}>{name}</Text>
                    <Text style={{ fontSize: 18, margin: 10, color:'white' }} numberOfLines={2}>{creationDate.toLocaleString()}</Text>
                </View>
            </TouchableOpacity>
        </Swipeout>
    );
}

export default class TodoListComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sortState: SORT_ASCENDING,
            todoLists: [],
            searchedName: ''
        };
        this.reloadData();
        realm.addListener('change', () => {
            this.reloadData();
        });
        console.log("Database Path = " + realm.path);
    }

    sort = () => {
        this.setState({
            sortState: this.state.sortState === SORT_ASCENDING ? SORT_DESCENDING : SORT_ASCENDING,
            todoLists: this.state.todoLists.sorted("name", this.state.sortState === SORT_DESCENDING ? true : false)
        });
    }

    reloadData = () => {
        queryAllTodoLists().then((todoLists) => {
            this.setState({ todoLists });
        }).catch((error) => {
            this.setState({ todoLists: [] });
        });
        console.log(`reloadData`);
    }

    render() {
        return (
            <View style={styles.container}>
                <HeaderComponent title={"Todo List"}
                    hasAddButton={true}
                    hasDeleteAllButton={true}
                    showAddTodoList={
                        () => {
                            this.refs.popupDialogComponent.showDialogComponentForAdd();
                        }
                    }
                    hasSortButton={true}
                    sort={this.sort}
                    sortState={this.state.sortState}
                />
                <TextInput style={styles.textInput} placeholder="Search Todo" autoCorrect={false}
                    onChangeText={(text) => {
                        this.setState({ searchedName: text });
                        filterTodoLists(text).then(filteredTodoLists => {
                            this.setState({ todoLists: filteredTodoLists });
                        }).catch(error => {
                            this.setState({ todoLists: [] });
                        });
                    }}
                    value={this.state.searchedName}
                />
                <FlatList
                    style={styles.flatList}
                    data={this.state.todoLists}
                    renderItem={({ item, index }) => <FlatListItem {...item} itemIndex={index}
                        popupDialogComponent={this.refs.popupDialogComponent}
                        onPressItem={() => {
                            // alert(`You pressed item `);
                            /*
                            insertTodos2TodoList(item.id, [
                                {
                                    id: 1,
                                    name: "Xyz1",
                                    done: false
                                },
                                {
                                    id: 2,
                                    name: "Xyz2",
                                    done: true
                                },
                                {
                                    id: 3,
                                    name: "Xyz3",
                                    done: true
                                }
                            ]).then(insertedTodos => {
                                alert(`Added faked Todos: ${JSON.stringify(insertedTodos)}`);     
                            }).catch(error => {
                                alert(`Cannot add faked Todos. Error: ${error}`);     
                            });
                            */
                            getTodosFromTodoListId(item.id).then(insertedTodos => {
                                alert(`Faked Todos: ${JSON.stringify(insertedTodos)}`);
                            }).catch(error => {
                                alert(`Cannot find faked Todos. Error: ${JSON.stringify(error)}`);
                            });
                        }} />}
                    keyExtractor={(item, index) => index.toString()}
                />
                <PopupDialogComponent ref={"popupDialogComponent"} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
    },
    flatList: {
        flex: 1,
        flexDirection: 'column',
    },
    textInput: {
        height: 40,
        padding: 10,
        margin: 10,
        borderColor: 'gray',
        borderWidth: 1
    },
});

