import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";

const db = SQLite.openDatabase("notes.db");	
console.log(FileSystem.documentDirectory);

// const SAMPLE_NOTES = [
//   { title: FileSystem.documentDirectory, done: false, id: "0" },
//   { title: "Do the laundry", done: false, id: "1" },
//   { title: "More sample data", done: false, id: "2" },
// ];

export default function NotesScreen({ navigation, route }) 
{
//   const [notes, setNotes] = useState(SAMPLE_NOTES);
const [notes, setNotes] = useState([]);

// Recall that executeSql takes 4 arguments: SQL to be run, arguments for the SQL, a success function that contains the results (in _array), and an error function. We use the third to update the state array. 
function refreshNotes()
{
    db.transaction((tx) =>
    {
        tx.executeSql(
            "SELECT * FROM notes",
            null,
            (txObj, { rows: { _array } }) => setNotes(_array),
            (txObj, error) => console.log(`Error: ${error}`));
    });
}

// Set up the database on first run.
useEffect(() => 
{
    db.transaction((tx) =>
    {
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS notes
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                done INT)`
        );
    },
    // Recall that transaction takes 3 arguments: a transaction callback, an error function (here, we leave this as null), and finally a success function. It’s upon success that we call refreshNotes. 
    null,
    refreshNotes 
    );
}, []);

  // This is to set up the top right button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={addNote}>
          <Ionicons
            name="ios-create-outline"
            size={30}
            color="black"
            style={{
              color: "#f55",
              marginRight: 10,
            }}
          />
        </TouchableOpacity>
      ),
    });
  });

  // Monitor route.oarams for changes and add items to database.
  useEffect(() => 
  {
      if (route.params?.text)
      {
        db.transaction(
            (tx) => 
            {
                tx.executeSql("INSERT INTO notes (done, title) VALUES (0, ?)", 
                [route.params.text,]);
                
            },
            null,
            refreshNotes
          );
      }
  }, [route.params?.text]);

  function addNote() 
  {
    navigation.navigate("Add Screen");
    // const newNote = {
    //   title: "Sample note",
    //   done: false,
    //   id: notes.length.toString(),
    // };
    // setNotes([...notes, newNote]);
  }

   //Deletes a task from database
   function deleteNote(id) 
   {
    db.transaction(
      (tx) => {
        tx.executeSql("DELETE FROM table where id=?",[id]);
      },
      null,
      refreshNotes
    );
  }

  function renderItem({ item }) {
    return (
      <View
        style={{
          padding: 10,
          paddingTop: 20,
          paddingBottom: 20,
          borderBottomColor: "#ccc",
          borderBottomWidth: 1,
        }}
      >
        <Text>{item.title}</Text>
        {/* <TouchableOpacity onPress={deleteNote}>
        <Ionicons 
        name="trash-outline" 
        size={24} 
        color="black"
        style=
        {{
            // color: "#f55",
            marginRight: 10,
        }}/>
        </TouchableOpacity> */}
      </View>
      
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderItem}
        style={{ width: "100%" }}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffc",
    alignItems: "center",
    justifyContent: "center",
  },
});