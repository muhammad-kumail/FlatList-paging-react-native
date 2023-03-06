import axios from 'axios';
import React, { useEffect, useState, useCallback, useRef } from 'react';

import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Text,
  View,
  RefreshControl,
  Image,
  FlatList,
  TouchableOpacity as Button
} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown'

export default function App() {
  const [users, setUsers] = useState({
    users: null,
    total: 100,
    skip: 0,
    limit: 6,
  });
  const [pages, setPages] = useState(10);
  const [pageArr, setPageArr] = useState([]);
  const [refreshing, setRefreshing] = useState(true);
  const flatListRef = useRef(null);
  const dropdownRef = useRef(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  }, []);

  useEffect(() => {
    axios.get(`https://dummyjson.com/users?limit=${users.limit}&skip=${users.skip}&select=firstName,lastName,image`)
      .then((respose) => {

        console.log(respose.data);
        if (users.limit > respose.data.limit) {
          setUsers({ ...respose.data, limit: users.limit });
        } else {
          setUsers(respose.data);
        }

        setPages((respose.data.total / users.limit) - 1);

        let arr = [];
        for (let i = 0; i < Math.ceil(respose.data.total / users.limit); i++) {
          arr.push(i+1);
        } setPageArr(arr);

        setRefreshing(false)
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
        }
      }).catch((err) => {
        console.log("Something Wrong> ", err);
        setRefreshing(false)

      })
  }, [users.users === null, users.skip, refreshing === true])

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.itemOuterView}>
        <View style={[{ flex: 2 }, styles.itemInnerView]}>
          <Image source={{ uri: item.image }} style={styles.avator} />
        </View>
        <View style={[{ flex: 8 }, styles.itemInnerView]}>
          <Text style={styles.itemText}>{item.firstName} {item.lastName}</Text>
        </View>
      </View>
    );
  }
  const listFooter = () => {
    return (
      <View style={styles.listFooter}>
        {users.skip / users.limit > 0 ?
          <Button style={styles.button} onPress={() => { setUsers({ ...users, skip: users.skip - users.limit }); setRefreshing(true); }}>
            <Text style={styles.buttonText}>Prev</Text>
          </Button> : null
        }
        <SelectDropdown
          ref={dropdownRef}
          data={pageArr}
          defaultValue={(users.skip/users.limit)+1}
          
          buttonStyle={styles.dropDrown}
          buttonTextStyle={{fontSize: 20}}
          onSelect={(selectedItem, index) => {
            console.log(selectedItem, index)
            setUsers({...users,skip: (selectedItem-1)*users.limit});
            setRefreshing(true);
          }}
          buttonTextAfterSelection={(selectedItem, index) => {
            return selectedItem
          }}
          rowTextForSelection={(item, index) => {
            return item
          }}
        />
        {users.skip / users.limit < pages ?
          <Button style={styles.button} onPress={() => { setUsers({ ...users, skip: users.skip + users.limit }); setRefreshing(true); }}>
            <Text style={styles.buttonText}>Next</Text>
          </Button> : null
        }
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'light-content'} backgroundColor={'orange'} />
      <View style={styles.header}>
        <Text style={[styles.itemText, { color: 'white', fontSize: 23, fontWeight: 'bold' }]}>Page: {(users.skip / users.limit) + 1}</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={users.users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListFooterComponent={listFooter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'orange',
    height: '8%',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3
  },
  itemOuterView: {
    flexDirection: 'row',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 3,
  },
  itemInnerView: {
    justifyContent: 'center',
  },
  avator: {
    height: 50,
    width: 50,
    borderRadius: 75
  },
  itemText: {
    color: 'black',
    fontSize: 18
  },
  listFooter: {
    flexDirection: 'row',
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderWidth: 1,
    borderRadius: 18,
    height: '70%',
    padding: 8,
    paddingHorizontal: 30,
    margin: 10,
    alignItems: 'center',
    borderColor: 'orange',
    backgroundColor: 'white',
    elevation: 3
  },
  buttonText: {
    color: 'orange',
    fontSize: 16
  },
  dropDrown:{
    width:'15%',
    height: '70%',
    borderRadius: 18,
    backgroundColor: 'white',
    elevation: 3
  }
});
