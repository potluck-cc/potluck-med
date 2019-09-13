import React, { memo } from "react";
import { StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Icon } from "react-native-elements";
import { Layout, List, Text } from "react-native-ui-kitten";
import Modal from "react-native-modalbox";
import { Colors, isIphoneXorAbove } from "../common";
import { Analytics } from "aws-amplify";

const counties = [
  { name: "All Counties" },
  { name: "Atlantic" },
  { name: "Bergen" },
  { name: "Burlington" },
  { name: "Camden" },
  { name: "Capemay" },
  { name: "Cumberland" },
  { name: "Essex" },
  { name: "Gloucester" },
  { name: "Hudson" },
  { name: "Hunterdon" },
  { name: "Mercer" },
  { name: "Middlesex" },
  { name: "Monmouth" },
  { name: "Morris" },
  { name: "Ocean" },
  { name: "Passaic" },
  { name: "Salem" },
  { name: "Somerset" },
  { name: "Sussex" },
  { name: "Union" },
  { name: "Warren" }
];

export default memo(function DoctorsListFilterModal({
  isOpen = false,
  closeModal = () => {},
  setCountyFilter = () => {},
  countyFilter
}) {
  function renderItem({ item: { name } }) {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => {
          if (name === "All Counties") {
            setCountyFilter(null);
          } else {
            Analytics.record({
              name: "countyFilterApplied",
              attributes: {
                county: name
              }
            });
            setCountyFilter(name);
          }
          closeModal();
        }}
      >
        <Text
          category="s1"
          style={
            name === countyFilter
              ? styles.activeListItem
              : name === "All Counties" && !countyFilter
              ? styles.activeListItem
              : null
          }
        >
          {name}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClosed={closeModal}
      coverScreen
      swipeToClose={false}
    >
      <Layout style={styles.container}>
        <TouchableOpacity onPress={closeModal} style={styles.closeContainer}>
          <Icon
            size={30}
            color="black"
            name="close"
            type="material-community"
          />
        </TouchableOpacity>

        <List
          data={counties}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      </Layout>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  closeContainer: {
    alignSelf: "flex-end",
    marginLeft: 15,
    marginRight: 15,
    marginTop: Platform.select({
      android: 15,
      ios: isIphoneXorAbove() ? 30 : 25
    })
  },
  list: {
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center"
  },
  listItem: {
    padding: 15
  },
  activeListItem: {
    color: Colors.blue
  }
});
